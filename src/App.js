//Модуль для работы с базой
import { DB }  from "social-framework/build/classes/db.js"
import config from "../conf.json"

const browser = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.85 YaBrowser/21.11.4.727 Yowser/2.5 Safari/537.36"

//Старт
Start().then().catch()
async function Start () {

    //коннект
    DB.Client = await new DB().Init(config, config.db)


}

async function friends_get (token, browser, account_id) {
    let count = 5000; //добавить пользователей за раз
    let url = `https://api.vk.com/method/friends.get?user_id=${account_id}&count=${count}&fields=bdate&access_token=${token}&v=5.103`;
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

async function friends_send (token, browser, user_id, message) {
    let seconds = Math.floor(Date.now() / 1000);
    message = encodeURI(message);
    let url = `https://api.vk.com/method/messages.send?user_id=${user_id}&message=${message}&random_id=${seconds}&access_token=${token}&v=5.103`;
    console.log(url)

    //запрос новостей
    let result = await axios({
        method: 'get',
        url: url,
        headers: {'User-Agent': browser}
    });

    console.log(result.data)
    if ((result.data) && (result.data.response))
        return true;

    return false;
}