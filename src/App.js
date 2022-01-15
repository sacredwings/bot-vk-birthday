import axios from 'axios'

//Модуль для работы с базой
import { DB }  from "social-framework/build/classes/db.js"
import conf from "../conf.json"

const browser = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.85 YaBrowser/21.11.4.727 Yowser/2.5 Safari/537.36"

setInterval(() => {
    //Старт
    Start().then((res)=>{
        console.log(res)
    }).catch()
}, 60*60*1000);

Start().then((res)=>{
    console.log(res)
}).catch()

async function Start () {

    let date = new Date();
    date.setUTCHours(date.getUTCHours()+7) // часовой пояс нужно вставить из профиля
    let hour = date.getUTCHours(); //текущий час
    let day = date.getUTCDate();
    let month = date.getUTCMonth()+1;

    date = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;

    //запуск только в нужное время
    if (hour !== conf.timeHour)
        return 'Не наступил нужный час'

    //конект
    const dbName = conf.db
    const url = `mongodb://${conf.login}:${conf.password}@${conf.host}:${conf.port}/?authSource=${conf.source}`
    DB.Client = await new DB().Init(conf, conf.db)

    //узнаем, поздравлял или нет
    let resultDbGet = await dbGet(date)
    if (resultDbGet)
        return 'Уже поздравил'

    //запрос друзей
    let arUsers = await friends_get (conf.token, conf.account)
    if (!arUsers.length)
        return 'Нет дней рождений'

    //обнуляем таймер
    let time = 1

    //перебор друзей
    for (let user of arUsers) {
        if (!user.bdate) continue //нет даты, пропускаем

        let bdate = user.bdate.split('.')
        if (bdate.length < 2) continue //нет даты или месяца, пропускаем

        //дату VK переводим в цифру
        bdate[0] = Number(bdate[0])
        bdate[1] = Number(bdate[1])

        //день и месяц совпадают
        if ((day !== bdate[0]) || (month !== bdate[1])) continue //день или месяц не совпадает

        //отправление сообщений
        setTimeout(async ()=>{
            await friends_message_send(conf.token, user.id, conf.message);
        }, time * 1000);
        time += 1
    }

    //сохранение резудльтата
    await dbSave (date)

    return 'Все отлично'
}

async function dbSave (date) {
    let collection = DB.Client.collection('send_date')
    let result = await collection.insertOne({date: date})
}
async function dbGet (date) {
    let collection = DB.Client.collection('send_date')
    let result = await collection.findOne({date: date})
    return result
}


async function friends_get (token, user_id) {
    let count = 5000; //добавить пользователей за раз
    let url = `https://api.vk.com/method/friends.get?user_id=${user_id}&count=${count}&fields=bdate&access_token=${token}&v=5.103`;
    console.log(url)

    //запрос новостей
    let result = await axios({
        method: 'get',
        url: url,
        headers: {'User-Agent': browser}
    });

    if ((result.data) && (result.data.response) && (result.data.response.items) && (result.data.response.items.length))
        return result.data.response.items;

    return false;

}

async function friends_message_send (token, user_id, message) {
    let seconds = Math.floor(Date.now() / 1000);
    message = encodeURI(message);
    let url = `https://api.vk.com/method/messages.send?user_id=${user_id}&message=${message}&random_id=${seconds}&access_token=${token}&v=5.103`;
    console.log(url)

    /*
    //запрос новостей
    let result = await axios({
        method: 'get',
        url: url,
        headers: {'User-Agent': browser}
    });

    if ((result.data) && (result.data.response))
        return true;

    return false;*/
}