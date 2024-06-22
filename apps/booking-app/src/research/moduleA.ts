import { Module } from '@nestjs/common'

@Module({
  providers: [
    {
      provide: ModuleA.MODULE_A,
      useValue: 666,
    },
  ],
  exports: [ModuleA.MODULE_A],
})
export class ModuleA {
  static MODULE_A = 'MODULE_A'
}
