import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';

@Injectable()
export class TimeNowToolService {
  readonly tool;

  constructor() {
    this.tool = tool(
      async () => {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return {
          local: local.toISOString().replace('Z', '').slice(0, 19),
          iso: now.toISOString(),
          timestamp: now.getTime(),
          timezoneOffset: now.getTimezoneOffset(),
        };
      },
      {
        name: 'time_now',
        description:
          '获取当前服务器时间，返回本地时间字符串（local）、ISO UTC 字符串（iso）、毫秒级时间戳（timestamp）和时区偏移分钟（timezoneOffset）。',
      },
    );
  }
}

