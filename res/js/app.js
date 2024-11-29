var app = {};
$(document).ready(function() {
    app = {
        key: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyIsImtpZCI6IktYMk40TkRDSTJ5NTA5NWpjTWk5TllqY2lyZyJ9.eyJpc3MiOiJodHRwczovL2x1ZHkuZ2FtZS5vbnN0b3ZlLmNvbSIsImF1ZCI6Imh0dHBzOi8vbHVkeS5nYW1lLm9uc3RvdmUuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6IjEwMDAwMDAwMDAyNzUwMzUifQ.ESuJfHQxHs4D8c1ToDOoklmIEbAdqYbBRtuopwEnSMnib2nS4RLpyRJJDROv8ELKdmFj2EQmMBFpJmqMTpy5YkF77nRQTqplVN1gV-eCtXkcQAXGS-AHsOkXb8VR1SUvVY8hd0UQ67oVBtjzcbk7PQA4gH4gSgGfGrlPL41AknRN92e9rFM69ImEsUZJcbtBnv_dbxTn1Sar6UBsRk9beWX8XYSzeJpDcBq5SqtblJo_EUvWVbA2iZRxVS9d5yGVjP4UAYhB7J9JiMxl2vodvYsvxXbiRVobr8Y0z4o0O6U4NduAfdYoWvOYrWRhkgGBTvfb6jtkyxa4EHx_Ny6F0w",
        gemDatas: {
            "1레벨 멸화의 보석": {}, "2레벨 멸화의 보석": {}, "3레벨 멸화의 보석": {}, "4레벨 멸화의 보석": {}, "5레벨 멸화의 보석": {}, "6레벨 멸화의 보석": {}, "7레벨 멸화의 보석": {}, "8레벨 멸화의 보석": {}, "9레벨 멸화의 보석": {}, "10레벨 멸화의 보석": {},
            "1레벨 홍염의 보석": {}, "2레벨 홍염의 보석": {}, "3레벨 홍염의 보석": {}, "4레벨 홍염의 보석": {}, "5레벨 홍염의 보석": {}, "6레벨 홍염의 보석": {}, "7레벨 홍염의 보석": {}, "8레벨 홍염의 보석": {}, "9레벨 홍염의 보석": {}, "10레벨 홍염의 보석": {},
            "1레벨 겁화의 보석": {},  "2레벨 겁화의 보석": {}, "3레벨 겁화의 보석": {}, "4레벨 겁화의 보석": {}, "5레벨 겁화의 보석": {}, "6레벨 겁화의 보석": {}, "7레벨 겁화의 보석": {}, "8레벨 겁화의 보석": {}, "9레벨 겁화의 보석": {}, "10레벨 겁화의 보석": {},
            "1레벨 작열의 보석": {}, "2레벨 작열의 보석": {}, "3레벨 작열의 보석": {}, "4레벨 작열의 보석": {}, "5레벨 작열의 보석": {}, "6레벨 작열의 보석": {}, "7레벨 작열의 보석": {}, "8레벨 작열의 보석": {}, "9레벨 작열의 보석": {}, "10레벨 작열의 보석": {},
        },
        characters: [],
        viewDatas: [],
        init: function() {
            app.eventHandler();
        },
        eventHandler: async function() {
            // 초기 보석데이터 세팅
            await app.setGetDatas();
            $(".loading").addClass("displaynone");
        },
        getCharacters: async function() {
            $(".loading").removeClass("displaynone");
            let nickname = $("#nickname").val();
            if (!nickname) {
                alert("캐릭터명을 입력해주세요.");
                $(".loading").addClass("displaynone");
                return;
            }
            let characters = await app.searchCharacter(nickname);
            if (characters.length < 1) {
                alert("검색된 닉네임이 없습니다.");
                $(".loading").addClass("displaynone");
                return;
            }
            else {
                characters.forEach(function (character) {
                    app.characters.push(character.CharacterName);
                });

                // 전체 캐릭터 보석 조회
                await app.searchAllGems();
            }

            let total_price = 0;
            for (const key in app.gemDatas) {
                total_price += app.gemDatas[key].cnt * app.gemDatas[key].price;
            }
            app.makeView(new Intl.NumberFormat().format(total_price));
        },
        makeView: function(total_price) {
            $("#total_price").html(total_price);

            let gem_cards = '';
            for (const key in app.gemDatas) {
                if (app.gemDatas[key].cnt > 0) {
                    let gem_card = $("#gem_card").html();
                    gem_cards += gem_card.replace('{{gem_info}}', `<img src="${app.gemDatas[key].icon}" style="width: 15%;">${key}`)
                                         .replace('{{gem_cnt}}', `${new Intl.NumberFormat().format(app.gemDatas[key].cnt)}개`);

                }
            }
            $(".total-value").append(gem_cards);

            $(".loading").addClass("displaynone");
        },
        searchAllGems: async function() {
            const data = {
                filters: "gems"
            }
            for (var i=0; i < app.characters.length; i++) {
                let nickname = app.characters[i];
                let ep = {
                    url: `https://developer-lostark.game.onstove.com/armories/characters/${nickname}`,
                    method: "GET"
                }

                if (!app.viewDatas[nickname]) {
                    app.viewDatas.push({nickname: nickname, gems: []});
                }
                var r = await app.ajax(ep, data);
                if (r) {
                    if (r.ArmoryGem.Gems) {
                        r.ArmoryGem.Gems.forEach(function(gem) {
                            const name = gem.Name.replace(/<\/?[^>]+(>|$)/g, "");
                            if (app.gemDatas[name]) {
                                if (!app.gemDatas[name].cnt && app.gemDatas[name].cnt !== 0) {
                                    app.gemDatas[name].cnt = 0;
                                }
                                app.gemDatas[name].cnt++;
                            }
                        });
                    }
                }
            }
        },
        searchCharacter: async function(nickname) {
            const ep = {
                url: `https://developer-lostark.game.onstove.com/characters/${nickname}/siblings`,
                method: "GET"
            }
            return await app.ajax(ep);
        },
        setGetDatas: async function() {
            var i=0;
            for (const key in app.gemDatas) {
                i++;
                if (app.gemDatas.hasOwnProperty(key)) {
                    var result = await app.getGemPrice(key, i);
                    app.gemDatas[key] = {
                        icon: result.Items[0].Icon,
                        price: result.Items[0].AuctionInfo.BuyPrice,
                        cnt: 0,
                    };
                }
            }
        },
        getGemPrice: async function(itemName) {
            const ep = {
                url: "https://developer-lostark.game.onstove.com/auctions/items",
                method: "POST"
            }
            let data = {
                CategoryCode: 210000,
                secondCategory: 0,
                itemName: itemName,
                "sort": "BUY_PRICE",
            };
            try {
                return await app.ajax(ep, data);
            }
            catch (error) { }
        },
        reset: function() {
            $("#nickname").val('');
            $(".total-value").empty();
            $("#total_price").html(0);
            app.characters = [];
        },
        ajax: function (ep, data=null) {
            return new Promise((resolve, reject) => {
                let url = ep.url;
                let dt = null;
                if (ep.method == 'GET') {
                    const params = new URLSearchParams(data);
                    url += "?" + params.toString();
                }
                else {
                    dt = JSON.stringify(data);
                }
                $.ajax({
                    url: url,
                    type: ep.method,
                    headers: {
                        accept: "application/json",
                        authorization: `bearer ${app.key}`,
                    },
                    contentType: "application/json",
                    data: dt,
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (xhr, status, error) {
                        alert("api 호출수 제한");
                        reject(error);
                    },
                });
            });
        },
    };
    app.init();
});