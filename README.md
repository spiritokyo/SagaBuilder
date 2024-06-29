## Motivation

- The advent of distributed transactions is inextricably linked with microservice architecture. Sometimes in order to implement business process it's required interaction with multiple services beyound target microservice (microservice-initiator). Such operations can be splitted in several steps, span multiple microservices, can be time-consuming (saga is about long-living process), can be depended on 3rd party infrastructure/api etc. Under "normal" circumstances we could try implement such long (time-consuming) oprations (transaction) within one DB, but in microservice world is not always possible: hypotetical business operation might have affection on different databases in different microservices which are beyound of our control (f.e 3rd provider) and furthermore in the case of happening some error, we must rollback all previous changes in order to not violate data consistency between different data sources. 
- This repository is intended to simplify prototyping / building such business operation following [saga orchestrator pattern](https://microservices.io/patterns/data/saga.html#example-orchestration-based-saga)

## Usecase and possible pitfalls
Let's consider hypotetical business operation and analyze potential difficulties. Ok, we got task implement "reservation booking on course" for white-hat hacker courses in our state university. Such business operation can be divided in 4 steps:
1. Register ticket on booking course [**booking microservice**]
1. Check course availability [**course microservice**]
2. Pay for the course (withdraw money from account) [**payment microservice**]
3. Booking confirmation [**booking microservice**]

- You might wonder, can we not register a booking ticket at the very last stage (not on the first one)? -  No, because if during saga execution booking service (storing information about actual booking) goes down -> we lost booking data, that's why this information should be persisted (though here there is option to store user's input data as JSONB inside saga iternal state and persist booking aggregate later). Apart of it there are even more reason to distinguish `creating ticket on booking course` and `confirmation such ticket on booking course`, for instance we would want to collect data for analytics (how many courses are cancelled? how many times takes the entire chain of reservtation booking? etc).

But otherwise, it look's pretty simple right? For monolite application with the single database we could just join all these operation in single transaction, but unfortunately we have a deal with microservices where each microservice is fully standalone and datasources also aren't related with each other => we don't have a way to join several datasource in a single transaction :( 

At this point we have composed basical steps for our hypotecal usecase, right know let's try to assume what can goes wrong during these steps and add a little bit ambiguity (on this step i suggest you are familiar [with orchestrate-based saga pattern](https://microservices.io/patterns/data/saga.html#example-orchestration-based-saga) in general details). Unfortunately each question originates only new ones:

1. **Q:** **Which way we should implement saga orchestrator?**
**A:** I guess there are > 1 ways to implement saga orchestator, but the most intuitive and reasonable way is to design saga orchestrator in the paradigm of aggregate root (from the viewpoint of DDD). Essentially saga orchestrator is aggregate root and under the hood such orchestrator contains information about current state of saga, id to another aggregate root (child aggregate root) and with completing the next steps (or rollbacking the previous ones) saga apppropriately updates own state (and maybe depended aggregates).
------------
5. **Q: Which way saga orchestrates multiple services? Does it master data directly?**
**A:** Logic of saga should lie around processing state, but not around mastering data (instead of directly data updating we must send message into some bus and another service should update own datasource - it’s about splitting zone of responsibility). 

	Saga workflow should looks like: Message In →Load saga → Update own state → **Message out** → Persist saga
	- **Message out** should appear at least once inside saga - result of such saga. And after that, internal state of saga (data which saga held) can be deleted
-------------
1. **Q:** **What if on some step an error occurs? Should we cancel saga or try again?**
**A:** Steps within saga can be either `compensatable`, `pivot` or `retriable`. In order to understand how saga should work we must create appropriate table describing steps:

| # |  Step | Service  | Transaction  | Compensating | Type |
| - | ---------------------------------- | ------------- | ------------------------------------- | ------------------------ | ------------------------ |
| 1 | Register ticket on booking cours                   |   Booking  |  registerTicketOnBooking()                     |   canceTicketOnBooking()  | compensatable
| 2 | Check course availability |   Course  |  checkCourseAvailability()    |   -                           | compensatable
| 3 | Pay for the course           |   Payment |  authorizePayment()             |   refundPayment() | pivot
| 4 | Booking confirmation       |   Booking  |  confirmBooking()                 |  -                            | retriable

   - `compensatable` means that this step can be rolled back in the case of failure
   - `pivot` means that all steps after this one should be guaranteed completed successfully
   - `retriable` means that this step should be retry until success

- Apart of this separation on step types we must understand, that saga step should be rolled back (`backward recovery`) only if business invariant has been been violated (f.e course is not available, amount of money to purchase course is not sufficient or user tries manually cancel the booking), in the case if the cause of error is infrastructure-based problem (f.e server has been gone down) - we should retry this step (`forward recovery`) later f.e using [**Circuit breaker pattern**](https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern).

[Note]: In our demo case with booking we will consider that booking confirmation contains business logic (university makes additional request to criminal justice service for background check to ensure that the future student is not criminal) and such operation can violate business invariant running backward recovery flow (for the sake of clarity), another words `booking confirmation` step is compensatable as well.

   - `Backward recovery` - full recovery via chain of compensating transaction
   - `Forward recovery` - try again fail operation instead of rollback via compensating transactions
------------
2. **Q:** **How to cancel active saga? (f.e user misreserved course and wants to cancel it right after sending request?)**
**A:** Most likely we should describe special endpoint for such cancel operation f.e: `/cancel-booking/id` and workflow should look like:
	1. User sends request to cancel endpoint.
	2. Service finds active saga by some `id` and updates its `isCancelled` field to `true`.
	3. On the next step active saga will read this field and run `backward recovery`.
	- It's also worth understanding that user can try to cancel active saga too lately (after completing saga) and in that case will get an error.
------------
4. **Q: How to protect saga from concurrencies anomalies?**
**A:** Saga transaction implement ACD principles by default, but not I (**isolation**) - we should handle it on the application level (apply contermeasures which prevent or reduce the impact of concurrency anomalies (caused by the lack of isolation)):

| Anomaly | What is it? | Contermeasures | Explanation |
|---|---|---|---|
| Lost updates | Occurs when two sagas read the same value and then update it based on the read value, with the second update overwriting the first | Semantic lock | Lock the resource to prevent other transactions from modifying |
|  |  | Commutative updates | Ensure updates can be applied in any order without affecting the final result (e.g., incrementing a counter) |
|  |  | Reread value | Reread the value before operation to ensure it hasn't changed unexpectedly |
| Dirty reads | Occurs when a saga reads the updates made by a another saga that has not yet completed those updates | Semantic lock |  |
|  |  | Pessimistic view | Use database-level locks to ensure data isn't read until it is committed |
| Non-repeatable read | Occurs when two different steps of saga read the same data and get different results because another saga has made updates | Semantic lock |  |
|  |  | Reread value |  | |

- As can seen be from the table, the main mean to mitigate concurrency anomalies in orchestrated saga - is to use application-level semantic locks. 
- In order to protect parallel execution of same saga instance we can use autoincrement `version field` (for saga instance itself).
- In order to protect saga's field from changing by another sagas, we can lock this field on specific `sagaId` column.
------------

## General explanation

Абстрагировать конструктор саг очень сложно и не всегда возможно в силу их сложности и широкой зоны ответственности. Поэтому данная реализаация конструктора саг исходит из того, что сага управляет под капотом каким-то ChildAggregateRoot и синхронизирует его состояние с состоянием саги. Что же это означает на практике? Возвращаясь к нашему случаю с букингом курсов, мы хотим управлять состоянием заказа курса (Booking) сквозь этапы повествования. Рассмотрим как меняется состояние самой саги (`SagaAggregateRoot (Saga)`) и ассоциированного c ним `ChildAggregateRoot (Booking)` со временем:

| #  | Saga step | Booking aggregate reaction | Saga aggregate reaction | Explanation |
|---|---|---|---|---|
| 0 | Preparation of saga | - | Create instance of saga and persist it (along with user's input data for booking) | The key point is - we must persist user's input data as part of saga as JSONB. I try to explain that: we would want have such workflow: user clicks button `Buy course` --> receives popup `Your request will be handled`, that means system успешно выполнила минимально необходимые операции для обработки букинга и дальше самостоятельно может обойтись без вмешательства со стороны пользователя (в итоге курс будет либо куплен, либо отклонен). Но какие именно это операции? Either just creating saga or creating saga + completing the first step (registering booking). Таких операций должно быть минимальное количество, в целом наша задача просто сообщить юзеру что процесс букинга запущен и когда-нибудь в будущем он завершится (вспоминаем как работает процесс покупки товара в маркетплейсе), а не заставлять ждать пока сага полностью выполнится (к тому же мы должны держать в голове, что каждый этап саги может занимать неопределенное количество времени). The problem is, we don't have guarantee that saga itself and child aggregate root (booking) will be in the same database -> we can't join creating saga and creating booking into atomic operation. That's mean there is no guarantee that after creating and persisting saga in DB, second request on persisting child aggregate root (as part of the first saga step) will be success, or there is not guarantee that right after persisting saga, the service where saga lives won't go down (along with user's input data) => **we must some way join saving user's data and creating and persisting saga into atomic operation**. The single way is to temprarily store user's data into saga aggregate, until booking aggregate will be persisted on the next step. |
| 1 | Register ticket on booking course | Create instance of booking aggregate. State of aggregate = `IS_AVAILABLE_PENDING` | Update information about completed step  of saga and persist booking aggregate | On this step we can get user's input data from RAM (or if service went go down it's possible to restore needed data from saga aggregate instance), based on it create booking instance and attach it to saga instance. In the future booking aggregate will be managed by saga aggregate (from the viewpoint of restoring and saving in DB) |
| 2 | Check course availability | Update state of booking aggregate.  State of aggregate = `PAYMENT_PENDING` | Update information about completed step  of saga and persist booking aggregate | Considered that if user was able to run booking process, course is available, but we need rechecking to be protected from user's who abused API directly without UI |
| 3 | Pay for the course | Update `paymentId` field; Update state of booking aggregate.  State of aggregate = `CONFIRMATION_PENDING` | Update information about completed step  of saga and persist booking aggregate | On this step saga orchestrator tries to pay for the course |
| 4 | Booking confirmation | Update state of booking aggregate.  State of aggregate = `CONFIRMED` | Update information about completed step  of saga and persist booking aggregate | On this step saga orchestrator does some business logic and decides if to confirm booking |
| 5 | After completing of saga | - | Update saga state f.e saga.isCompleted = true and remove it | We can use CDC (change data capture) - when saga status wiil be changed to isCompleted = true, delete Saga from DB and notify user |

В таблице выше отражена ситуация, когда сага развивается без ошибок, однако как она будет себя вести, когда некоторые шаги будут выполнены с ошибками и потребуются соответствующие компенсационные транзакции? Чтобы лучше разобраться в этом, необходимо отобразить стейт машину состояний саги (ради большеей наглядности я пометил шаги саги цифрами, а их компенсационные транзакции цифры со штрихами):

[![](https://i.ibb.co/wpzFWQj/image.png)](https://i.ibb.co/wpzFWQj/image.pnghttp://)

Как видно из схемы, казалось бы довольно простая операция превращается в солидную стейт машину, которую не так уж просто удержать в голове. Для большей наглядности я также привел диаграмму последовательности

[![](https://i.ibb.co/P977p5p/image.png)]()

## Пример реализации

Поняв флоу работы саги для букинга курсов, давайте рассмотрим как это может выглядеть на уровне кода. Алгоритм будет примерно следующий.
1. Описать шаги саги.
2. Описать инициализацию саги.

Начнем с первого.

### Общие замечания
- При реализации любого из шагов саги необходимо унаследовать абстрактный класс `SagaStep<T>`, где `T` - класс `ChildAggregateRoot`  передав в него инстанс event emitter'a, а также название текущего шага (и его компенсационную альтернативу). Важный нюанс заключается в том, что все шаги саги должны принимать один и тот же инстанс event emitter'a, который используется для внутренних целей синхронизации саги.
- Внутри метода invoke мы реализуем непосредственно логику работы шага, в методе `withCompensation` мы описываем те действия, которые в случае запуска механизма `backward recovery` откатили бы все изменения для метода `invoke`. Тело метода `withCompensation` может быть пустым, поскольку логика выполнения `invoke` не предпоплагает создания side effect (например операция проверки курса является read-only и не предполагает компенсационной транзакции).

### Step 1. Register ticker on booking course 

```ts
export class RegisterTicketOnBookingCourseStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'RegisterTicketOnBookingCourseStep' as const
  static STEP_COMPENSATION_NAME = 'RegisterTicketOnBookingCourseStepCompensation' as const

  constructor(public eventBus: EventEmitter) {
    super(eventBus, {
      stepName: RegisterTicketOnBookingCourseStep.STEP_NAME,
      stepCompensationName: RegisterTicketOnBookingCourseStep.STEP_COMPENSATION_NAME,
    })
  }

  invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void {
    const booking = Booking.create(ctx.dto)

    // Means that booking is persisted (will be stored in DB on the next iteration of saving)
    this.addChildAggregate(booking)
  }

  withCompensation(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void {
    if (!ctx.childAggregate) {
      return
    }

    ctx.childAggregate.cancelBooking()
  }
}
```
### Step 2. Check course availability 

```ts
export class CheckCourseAvailabilityStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'CheckCourseAvailabilityStep' as const
  static STEP_COMPENSATION_NAME = 'CheckCourseAvailabilityStepCompensation' as const

  constructor(
    public eventBus: EventEmitter,
    public readonly messageBroker: RabbitMQClient,
  ) {
    super(eventBus, {
      stepName: CheckCourseAvailabilityStep.STEP_NAME,
      stepCompensationName: CheckCourseAvailabilityStep.STEP_COMPENSATION_NAME,
    })
  }

  async invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): Promise<void> {
    if (!ctx.childAggregate) {
      throw new Error('Child aggregate is not defined')
    }

    const result = await this.messageBroker.sendCheckCourseAvailabilityCommand(
      new CheckCourseAvailabilityCommand(ctx.childAggregate.getDetails().courseId),
    )

    if (!result.isCourseAvailable) {
      throw new ReserveBookingErrors.BookingCourseIsNotAvailableError(
        ctx.childAggregate.getDetails().courseId,
      )
    }
    ctx.childAggregate.approveCourseAvailability()
  }

  withCompensation(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): void | Promise<void> {
    // Should be empty
  }
}
```

### Step 3. Pay for booking 
```ts
export class AuthorizePaymentStep extends SagaStep<Booking, ReserveBookingDTO> {
  static STEP_NAME = 'AuthorizePaymentStep' as const
  static STEP_COMPENSATION_NAME = 'AuthorizePaymentStepCompensation' as const

  constructor(
    public eventBus: EventEmitter,
    public readonly messageBroker: RabbitMQClient,
  ) {
    super(eventBus, {
      stepName: AuthorizePaymentStep.STEP_NAME,
      stepCompensationName: AuthorizePaymentStep.STEP_COMPENSATION_NAME,
    })
  }

  async invoke(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): Promise<void> {
    if (!ctx.childAggregate) {
      return
    }

    const result = await this.messageBroker.sendAuthorizeCardCommand(
      new AuthorizePaymentCardCommand(
        ctx.childAggregate.getId(),
        ctx.childAggregate.getDetails().customerId,
      ),
    )

    if (!result.authorizedPayment) {
      throw new ReserveBookingErrors.BookingPaymentInfraError(
        { paymentId: result.paymentId },
        ctx.childAggregate.getDetails(),
      )
    }

    ctx.childAggregate.approvePayment(result.paymentId)
  }

  async withCompensation(ctx: TSagaStepContext<Booking, ReserveBookingDTO>): Promise<void> {
    if (!ctx.childAggregate) {
      return
    }

    try {
      // Make refund payment
      const paymentResult = await this.messageBroker.sendAuthorizeRefundCardCommand(
        new AuthorizePaymentCardCommand(
          ctx.childAggregate.getId(),
          ctx.childAggregate.getDetails().customerId,
        ),
      )

      if (!paymentResult.authorizedPayment) {
        throw new ReserveBookingErrors.BookingPaymentInfraError(
          { paymentId: paymentResult.paymentId },
          ctx.childAggregate.getDetails(),
        )
      }

      ctx.childAggregate.refundPayment(paymentResult.paymentId)
    } catch (err) {
      throw new DomainBookingErrors.ExceptionAbortCreateBookingTransaction(
        (err as ReserveBookingErrors.BookingRepoInfraError).message,
      )
    }
  }
}
```

### Step 4. Confirm booking 























