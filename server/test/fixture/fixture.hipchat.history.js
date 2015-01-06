'use strict';

module.exports = {
  345678: {
    items: [
      {
        date: '2015-01-01T10:00:00.000000+09:00',
        from: {
          id: 123456,
          links: {
            self: 'https://api.hipchat.com/v2/user/123456'
          },
          mention_name: 'tanakataro',
          name: '田中 太郎 (tanaka_taro)'
        },
        id: '234abc2a-50d4-304b-4520-495db204cae6',
        mentions: [],
        message: 'これはメッセージの例です',
        room: {
          id: 345678,
          name: 'MyRoom',
          privacy: 'private'
        },
        type: 'message'
      },
      {
        date: '2015-01-01T10:30:00.000000+09:00',
        from: {
          id: 234567,
          links: {
            self: 'https://api.hipchat.com/v2/user/234567'
          },
          mention_name: 'suzukihanako',
          name: '鈴木 花子 (suzuki_hanako)'
        },
        id: '49208403-3fbd-4506-958a-048bde204cb3',
        mentions: [
          {
            id: 123456,
            links: {
              self: 'https://api.hipchat.com/v2/user/123456'
            },
            mention_name: 'tanakataro',
            name: '田中 太郎 (tanaka_taro)'
          }
        ],
        message: '@tanakataro This is an example message with mentions\nand new lines.',
        room: {
          id: 345678,
          name: 'MyRoom',
          privacy: 'private'
        },
        type: 'message'
      },
      {
        color: 'yellow',
        date: '2015-01-01T11:00:00.000000+09:00',
        from: 'GitHub',
        id: '304baedc-304b-3db8-49bc-183024abd304',
        mentions: [],
        message: '<a href=\'https://github.com/tanaka-taro\'>tanaka-taro</a> opened <a href=\'https://github.com/tanaka-taro/my-repo/pull/200\'>pull request 200</a> of <a href=\'https://github.com/tanaka-taro/my-repo\'>tanaka-taro/my-repo</a>: This is an example pull request',
        message_format: 'html',
        room: {
          id: 345678,
          name: 'MyRoom',
          privacy: 'private'
        },
        type: 'notification'
      }
    ],
    links: {
      self: 'https://api.hipchat.com/v2/room/MyRoom/history'
    },
    maxResults: 500,
    startIndex: 0
  }
};
