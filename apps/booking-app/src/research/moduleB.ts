import type { OnModuleInit } from '@nestjs/common'
import { Module } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'

import { ModuleA } from './moduleA'

@Module({
  imports: [ModuleA],
  providers: [
    {
      inject: [ModuleA.MODULE_A],
      provide: ModuleB.MODULE_B,
      useFactory: (value: number): number => value * 2,
    },
  ],
  exports: [ModuleB.MODULE_B],
})
export class ModuleB implements OnModuleInit {
  static MODULE_B = 'MODULE_B'
  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit(): void {
    const moduleA = this.moduleRef.get(ModuleA.MODULE_A)
    // console.log('🚀 ~ ModuleB ~ OnModuleInit ~ moduleA :', moduleA)
  }
}
