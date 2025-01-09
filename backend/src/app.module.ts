import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheStore, CacheModule } from '@nestjs/cache-manager';
import { WalletModule } from '@wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: +configService.get<number>('REDIS_PORT'),
          },
          ttl: 600,
        });
        return {
          store: store as unknown as CacheStore,
        };
      },
      inject: [ConfigService],
    }),
    WalletModule,
  ],
})
export class AppModule {}
