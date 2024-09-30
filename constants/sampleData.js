



export const sampleChats = [{
    avatar:"https://www.w3schools.com/howto/img_avatar.png",
    name:"John",
    _id:"1",
    groupChat: false,
    members:["1","2","3","4"]

},
{
    avatar:"https://www.w3schools.com/howto/img_avatar.png",
    name:"Jack",
    _id:"2",
    groupChat: false,
    members:["1","2"]

},
]
export const sampleUsers = [{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"John",
    _id:"1",


},
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Jack",
    _id:"2",

},

]
export const sampleNotifications = [{

    sender:{
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"John",
    },
    _id:"1",


},
{
    sender:{
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Jack",
    },
    _id:"2",

},
];

export const sampleMessage = [
    {
        attachments:[],
        content: "Watch Deadpool 3 With me??? <3",
        _id: "sadasdasdsad",
        sender:{
            _id: "user._id",
            name: "Cheeku "
        },
        chat: "chatId",
        createdAt: "2024-02-12T10:41:30.630Z"
    },
    {
        attachments:[
        {
            public_id: "asdasd 2",
            url: "https://www.w3schools.com/howto/img_avatar.png"
        },
        ],
        content: "",
        _id: "sadasdasdsasdaddsad",
        sender:{
            _id: "dsafasdfasdf",
            name: "Cheeku 2"
        },
        chat: "chatId",
        createdAt: "2024-02-12T10:41:30.630Z"
    },
    {
      attachments:[],
        content: "I'm hungry",
        _id: "12esqdwdsad",
        sender:{
            _id: "dsafasdfasdf",
            name: "Cheeku 3"
        },
        chat: "chatId",
        createdAt: "2024-02-12T10:41:30.630Z"
    },
    {
      attachments:[],
        content: "I'm tired",
        _id: "e32eeedefewf",
        sender:{
            _id: "dsafasdfasdf",
            name: "Cheeku 4"
        },
        chat: "chatId",
        createdAt: "2024-02-12T10:41:30.630Z"
    }

]

export const dashboardData = {
    users: [
      {
        name: "John Doe",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
        _id: "1",
        username: "john_doe",
        friends: 20,
        groups: 5,
      },
      {
        name: "John Boi",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
        _id: "2",
        username: "john_boi",
        friends: 20,
        groups: 25,
      },
    ],
  
    chats: [
      {
        name: "LabadBass Group",
        avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
        _id: "1",
        groupChat: false,
        members: [
          { _id: "1", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
          { _id: "2", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
        ],
        totalMembers: 2,
        totalMessages: 20,
        creator: {
          name: "John Doe",
          avatar: "https://www.w3schools.com/howto/img_avatar.png",
        },
      },
      {
        name: "L*Da Luston Group",
        avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
        _id: "2",
        groupChat: true,
        members: [
          { _id: "1",name: "Chaman", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
          { _id: "2",name: "Chaman 2", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
        ],
        totalMembers: 3,
        totalMessages: 20,
        creator: {
          name: "John Boi",
          avatar: "https://www.w3schools.com/howto/img_avatar.png",
        },
      },
    ],
  
    messages: [
      {
        attachments: [],
        content: "L*uda ka Message hai",
        _id: "sfnsdjkfsdnfkjsbnd",
        sender: {
          avatar: "https://www.w3schools.com/howto/img_avatar.png",
          name: "Chaman ",
        },
        chat: "chatId",
        groupChat: false,
        createdAt: "2024-02-12T10:41:30.630Z",
      },
  
      {
        attachments: [
          {
            public_id: "asdsad 2",
            url: "https://www.w3schools.com/howto/img_avatar.png",
          },
          {
            public_id: "asdsad 3",
            url: "https://www.w3schools.com/howto/img_avatar.png",
          },
          {
            public_id: "asdsad 4",
            url: "https://www.w3schools.com/howto/img_avatar.png",
          },
        ],
        content: "",
        _id: "sfnsdjkfsdnfkdddjsbnd",
        sender: {
          avatar: "https://www.w3schools.com/howto/img_avatar.png",
          name: "Chaman  2",
        },
        chat: "chatId",
        groupChat: true,
        createdAt: "2024-02-12T10:41:30.630Z",
      },
    ],
  };