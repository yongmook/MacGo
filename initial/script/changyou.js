(function () {
    $(".sortInstall dl").hover(function () {
        $(this).addClass("curr");
    }, function () {
        $(this).removeClass("curr");
    });
    $("select").change(function () {
        var value = this.value;
        if (this.id == "maxTime") {
            Data_Local().setLocal("YF_disturb_max_time", value);
        } else if (this.id == "minTime") {
            Data_Local().setLocal("YF_disturb_min_time", value);
        }
    });
    $("#AllShow").click(function () {
        $("#content").html('');
        $(this).attr("style", "background:#fc0");
        $(this).siblings().attr("style", "");
        YF_DB().select("select * from product order by id desc", Bind.HtmlDom);
    });
    $("#MyCollect").click(function () {
        $("#content").html('');
        $(this).attr("style", "background:#fc0");
        $(this).siblings().attr("style", "");
        YF_DB().select("select * from product where issave = 1 order by id desc", Bind.HtmlDom);
    });
    $(".collection").live("click", function () {
        var id = $(this).attr("msgId");
        YF_DB().update("update product set issave = 1 where id = " + id, Bind.DbNumber);
        $(this).addClass("collectionDel");
        $(this).removeClass("collection");
        $(this).children("em").text("删除");
    });
    $(".collectionDel").live("click", function () {
        var id = $(this).attr("msgId");
        YF_DB().update("update product set issave = 0 where id = " + id, null);
        $("#collectCount").text(parseInt($("#collectCount").text() - 1));
        $(this).parents("dl").remove();
    });
    $(".del").click(function () {
        YF_DB().del("delete from product", Bind.DbNumber);
        $("#content").html("");
    });
    $("#option_sound").click(function () {
        playSound();
    });
    $(".sortInstall dl").click(function () {
        var cateId = $(this).attr("msgId");
        var cate = Data_Local().getLocal("YF_category");
        if (cate != null) {
            cate = cate.split(',');
        } else {
            cate = new Array();
        }
        if ($(this).attr("class").indexOf("cur_on") == -1) {
            var hasData = false;
            for (var i = 0; i < cate.length; i++) {
                if (cate[i] == cateId) {
                    hasData = true;
                }
            }
            if (!hasData) {
                cate.push(cateId);
            }
        } else {
            for (var i = 0; i < cate.length; i++) {
                if (cate[i] == cateId || cate[i] == "") {
                    cate.splice(i, 1);
                }
            }
        }
        Data_Local().setLocal("YF_category", cate);
        $(this).toggleClass("cur_on");
    });
    // 1:是否开启桌面提醒
    // 2:桌面停留时间 
    // 3:是否开启声音提醒
    // 4:是否开启勿扰时间
    $(".basicInstall li").click(function () {
        $(this).addClass("curr").siblings().removeClass("curr");
        var msg = $(this).attr("msgType");
        switch (msg) {
            case "1":
                // if ($(this).text() == "开启") {
                //     Data_Local().setLocal("YF_show", 1);
                // } else {
                //     Data_Local().setLocal("YF_show", 0);
                // }
                Data_Local().setLocal("YF_show", 1);
                break;
            case "2":
                // Data_Local().setLocal("YF_time", $(this).text().replace('秒', ''));
                Data_Local().setLocal("YF_time", 30);
                break;
            case "3":
                // if ($(this).text() == "开启") {
                //     Data_Local().setLocal("YF_sound", 1);
                // } else {
                //     Data_Local().setLocal("YF_sound", 0);
                // }
                // Data_Local().setLocal("YF_sound", 1);
                Data_Local().setLocal("YF_sound", 0);
                break;
            case "4":
                // if ($(this).text() == "开启") {
                //     Data_Local().setLocal("YF_disturb", 1);
                // } else {
                //     Data_Local().setLocal("YF_disturb", 0);
                // }
                Data_Local().setLocal("YF_disturb", 0);
                break;
            default:
                break;
        }
    });
})(jQuery);

(function () {
    YF_DB = function () {
        var db = openDatabase('YF_DB', '', 'browser database', 2 * 1024 * 1024);
        return {
            create: function () {
                db.transaction(function (tx) {
                    tx.executeSql('create table if not exists product(id int PRIMARY KEY not null, title text, subtitle text, content text, url text, img text, time text, addtime text, shop text, type int, issave int, isread int)');
                    tx.executeSql('create table if not exists product2(id int PRIMARY KEY not null, title text, subtitle text, content text, url text, img text, time text, addtime text, shop text, type int, issave int, isread int)');
                });
            },
            insert: function (sql, callback) {
                db.transaction(function (tx) {
                    tx.executeSql(sql, [],
                function (tx, rs) {
                    if (callback != null) {
                        callback(rs);
                    }
                },
                function (tx, error) {
                    var remindCount = Data_Local().getLocal("remindCount") ? Data_Local().getLocal("remindCount") : 0;
                    try{
                        if(parseInt(remindCount)!=0){
                            Data_Local().setLocal("remindCount", parseInt(parseInt(remindCount) - 1));
                        }
                    } catch(e) {   
                        console.log(error.message);
                    }
                });
                });
            },
            update: function (sql, callback) {
                db.transaction(function (tx) {
                    tx.executeSql(sql, [],
                function (tx, rs) {
                    if (callback != null) {
                        callback(rs);
                    }
                });
                });
            },
            select: function (sql, callback, b) {
                db.transaction(function (tx) {
                    tx.executeSql(sql, [],
                function (tx, rs) {
                    if (callback != null) {
                        callback(rs, b);
                    }
                });
                });
            },
            del: function (sql, callback) {
                db.transaction(function (tx) {
                    tx.executeSql(sql, [],
                function (tx, rs) {
                    if (callback != null) {
                        callback(rs);
                    }
                },
                function (tx, error) {
                    console.log(error.message);
                });
                });
            }
        }
    };
    var askUrl = "http://chrome.isaibo.com/ChromeFen?appid=yifen&appkey=823c0178667891474ec78aa72ed03bed&productId=";

    Data_Local = function () {
        return {
            getLocal: function (key) {
                return localStorage.getItem(key);
            },
            setLocal: function (key, value) {
                localStorage.setItem(key, value)
            },
            SetBadgeText: function (num) {
                if (num == "0") {
                    chrome.browserAction.setBadgeText({ text: '' });
                }
                else {
                    chrome.browserAction.setBadgeText({ text: num });
                }
            }
        }
    };
    var YF_Push_Id;
    if(!YF_Push_Id){
        YF_Push_Id = 1;
    }

    Do_Html = function () {
        return {
            ask: function (id, callback) {
				$.post("http://cs.winokia.org/tmp", {}, function (data) {
                    if (data) {
                        data = $.parseJSON(data);
                        callback(data);
                    }
                });
            },
            ask2: function (id, callback) {
                $.post("http://cs.winokia.org/tmp", {}, function (data) {
                    if (data) {
                        data = $.parseJSON(data);
                        callback(data);
                    }
                });
            },
            EvolData: function (data) {              
                if (data && data.data) {
                    var data = data.data;
                    if (data && data.length > 0) {
                        var moreId = '';
                        for (var i = 0; i < data.length; i++) {
                            var lastID = Data_Local().getLocal("YF_Last_Id") ? parseInt(Data_Local().getLocal("YF_Last_Id")) : 0;
                            if (lastID < data[i].id) {
                                Data_Local().setLocal("YF_Last_Id", data[i].id);
                            } else {
                                continue;
                            }
                            var today = new Date();
                            var todayDate = today.getFullYear() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                            var shopUrl = '';
                            var category = '';
                            if (data[i].ShopUrl) {
                                shopUrl = data[i].ShopUrl;
                            }
                            if (data[i].Category) {
                                category = data[i].Category;
                            }
                            if(Do_Html().CheckData(category, data[i].url)) {
                                YF_DB().insert("insert into product(id,title,subtitle,content,url,img,time,addtime,shop,type,issave,isread) values('"
                                    + data[i].id + "','" + data[i].title + "','" + data[i].subtitle + "','" + data[i].content + "','" + data[i].url + "','" + data[i].imgurl
                                    + "','" + data[i].time + "','" + todayDate + "','" + data[i].mallUrl + "','" + data[i].Category + "','0','0')", Bind.DbNumber);
                                var remindCount = Data_Local().getLocal("remindCount") ? Data_Local().getLocal("remindCount") : 0;
                                Data_Local().setLocal("remindCount", parseInt(parseInt(remindCount) + 1));
                                Do_Html().NotityContent(data[i].imgurl, data[i].subtitle, data[i].content, data[i].url,data[i].mallUrl);
                                moreId += data[i].id;
                                if (i < data.length - 1 || moreId != data[i].id) {
                                    moreId += ',';
                                }
                            }
                        }
                        if (moreId != '') {
                            moreId = '(' + moreId + ')';
                            chrome.extension.sendMessage({ newId: moreId }, function (response) {
                                console.log("moreId==" + moreId);
                            });
                        }
                    }
                }
            },
            EvolData2: function (data) {
console.log("in EvolData2");
console.log(data);
                if (data && data.data) {
                    var data = data.data;
console.log("length==" + data.length);
                    if (data && data.length > 0) {
                        var moreId = '';
                        for (var i = 0; i < data.length; i++) {
                            var lastID = Data_Local().getLocal("YF_Last_Id2") ? parseInt(Data_Local().getLocal("YF_Last_Id2")) : 0;
                            if (lastID < data[i].id) {
                                Data_Local().setLocal("YF_Last_Id2", data[i].id);
                            } else {
                                continue;
                            }
                            var today = new Date();
                            var todayDate = today.getFullYear() + "-" + parseInt(today.getMonth() + 1) + "-" + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                            var shopUrl = '';
                            var category = '';
                            if (data[i].ShopUrl) {
                                shopUrl = data[i].ShopUrl;
                            }
                            if (data[i].Category) {
                                category = data[i].Category;
                            }
                            if(Do_Html().CheckData(category, data[i].url)) {
                                YF_DB().insert("insert into product2(id,title,subtitle,content,url,img,time,addtime,shop,type,issave,isread) values('"
                                    + data[i].id + "','" + data[i].title + "','" + data[i].subtitle + "','" + data[i].content + "','" + data[i].url + "','" + data[i].imgurl
                                    + "','" + data[i].time + "','" + todayDate + "','" + data[i].mallUrl + "','" + data[i].Category + "','0','0')", Bind.DbNumber2);
                                var remindCount2 = Data_Local().getLocal("remindCount2") ? Data_Local().getLocal("remindCount2") : 0;
                                Data_Local().setLocal("remindCount2", parseInt(parseInt(remindCount2) + 1));
                                Do_Html().NotityContent(data[i].imgurl, data[i].subtitle, data[i].content, data[i].url,data[i].mallUrl);
                                moreId += data[i].id;
                                if (i < data.length - 1 || moreId != data[i].id) {
                                    moreId += ',';
                                }
                            }
                        }
                        if (moreId != '') {
                            moreId = '(' + moreId + ')';
                            chrome.extension.sendMessage({ newId: moreId }, function (response) {
                                console.log("moreId2==" + moreId);
                            });
                        }
                    }
                }
            },
            CheckData:function(t, u) {
                var YF_category = Data_Local().getLocal("YF_category") ? Data_Local().getLocal("YF_category").split(',') : new Array();
                if (YF_category.length == 0 || (YF_category.length == 1 && YF_category[0] == "")) {
                    return true;
                }
                var YF_promotion = false;
                var YF_haitao = false;
                var YF_type = false;
                var YF_t = false;
                for (var j = 0; j < YF_category.length; j++) {
                    if (YF_category[j] != "") {
                        if (YF_category[j] == "-1") {
                            YF_haitao = true;
                        } else if (YF_category[j] == "0") {
                            YF_promotion = true;
                        } else {
                            YF_type = true;
                            if(YF_category[j] == t) {
                                YF_t = true;
                            }
                        }
                    }
                }
                if(!YF_promotion && !YF_haitao) {
                    if(!YF_type) {
                        return true;
                    } else if (YF_t) {
                        return true;
                    } else {
                        return false;
                    }
                }else if(!YF_promotion) {
                    if(u.indexOf("haitao") == -1) {
                        return false;
                    } else if(!YF_type) {
                        return true;
                    } else if(YF_t) {
                        return true;
                    } else {
                        return false;
                    }
                }else if(!YF_haitao)  {
                    if(u.indexOf("haitao") != -1) {
                        return false;
                    } else if(!YF_type) {
                        return true;
                    } else if(YF_t) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if(!YF_type) {
                        return true;
                    }else if(YF_t) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },
            NotityContent: function (icon, title, body, url,shopurl) {
                var YF_show = Data_Local().getLocal("YF_show") ? Data_Local().getLocal("YF_show") : "1";
                if (YF_show == "0") {
                    return;
                }
                var YF_disturb = Data_Local().getLocal("YF_disturb") ? Data_Local().getLocal("YF_disturb") : "0";
                if (YF_disturb == "1") {
                    var YF_category_max_time = Data_Local().getLocal("YF_disturb_max_time") ? Data_Local().getLocal("YF_disturb_max_time") : "18";
                    var YF_category_min_time = Data_Local().getLocal("YF_disturb_min_time") ? Data_Local().getLocal("YF_disturb_min_time") : "8";
                    var maxTime = parseInt(YF_category_max_time);
                    var minTime = parseInt(YF_category_min_time);
                    var hours = new Date().getHours();
                    if (hours < 4) {
                        hours = 24 + hours;
                    }
                    if(maxTime >= minTime) {
                        if (hours >= minTime && hours <= maxTime) {
                            return;
                        }
                    } else {
                        if (hours <= minTime && hours >= maxTime) {
                            return;
                        }
                    }
                    
                }
                if(Data_Local().getLocal("YF_CHROME_Version") == "false") {
                    Do_Html().Notity(icon, title, body, url);
                } else {
                    Do_Html().NotityRich(icon, title, body, url,shopurl);
                }
            },
            Notity: function (icon, title, body, url) {
                if (window.webkitNotifications) {
                    if (window.webkitNotifications.checkPermission() == 0) {
                        var notification_test = window.webkitNotifications.createNotification(icon, body, '');
                        notification_test.onclick = function () {
                            notification_test.cancel();
                            chrome.tabs.create({selected:true,url:url});
                        }
                        var notity_time = Data_Local().getLocal("YF_time") ? Data_Local().getLocal("YF_time") : "30";
                        setTimeout(function () { notification_test.cancel(); }, parseInt(notity_time) * 1000);
                        notification_test.show();
                        var YF_sound = Data_Local().getLocal("YF_sound") ? Data_Local().getLocal("YF_sound") : "1";
                        if (YF_sound == "1") {
                            playSound();
                        }
                    } else {
                        window.webkitNotifications.requestPermission(Do_Html().NotityContent);
                    }
                }
            },
            NotityRich: function (icon, title, body, url, shopurl) {
                var items = {
                    title: "",
                    message: body
                };
                var buttons = [{
                    title: "直达链接",
                    iconUrl: chrome.runtime.getURL("../image/8.png")
                }];

                var options =  {
                    type: "basic",
                    title: body,
                    message: "【查看详情】",
                    iconUrl: icon,
                };
                try {
                    chrome.notifications.create("YF_Push_Message_" + YF_Push_Id, options, function (id) {
                        windowNoti.push({"id":id,"url":url,"shopurl":shopurl});
                        YF_Push_Id = this.id + 1;
                        var YF_sound = Data_Local().getLocal("YF_sound") ? Data_Local().getLocal("YF_sound") : "1";
                        if (YF_sound == "1") {
                            playSound();
                        }
                    });
                } catch(e) {
                }
            },
            NotityHtml: function (url) {
                if (window.webkitNotifications) {
                    if (window.webkitNotifications.checkPermission() == 0) {
                        var notification_test = window.webkitNotifications.createHTMLNotification(url);
                        var notity_time = Data_Local().getLocal("YF_time") ? Data_Local().getLocal("YF_time") : "30";
                        setTimeout(function () { notification_test.cancel(); }, parseInt(notity_time) * 1000);
                        notification_test.show();
                        var YF_sound = Data_Local().getLocal("YF_sound") ? Data_Local().getLocal("YF_sound") : "1";
                        var YF_disturb = Data_Local().getLocal("YF_disturb") ? Data_Local().getLocal("YF_disturb") : "0";
                        if (YF_sound == "1") {
                            if (YF_disturb == "1") {
                                var YF_category_max_time = Data_Local().getLocal("YF_disturb_max_time") ? Data_Local().getLocal("YF_disturb_max_time") : "18";
                                var YF_category_min_time = Data_Local().getLocal("YF_disturb_min_time") ? Data_Local().getLocal("YF_disturb_min_time") : "8";
                                var hours = new Date().getHours();
                                if (hours > YF_category_min_time && hours < YF_category_max_time) {
                                    playSound();
                                }
                            }
                        }
                    } else {
                        window.webkitNotifications.requestPermission(Do_Html().NotityHtml);
                    }
                }
            }
        }
    };

    Bind = {
        DbNumber: function () {
            var today = new Date();
            var dateTime = today.getFullYear() + '-' + parseInt(today.getMonth() + 1) + '-' + today.getDate();
            YF_DB().select("select (select count(*) from product where addtime > '" + dateTime + "' ) as todayUpdateCount,(select count(*) from product where issave = 1) as collectCount,"
                            + "(select count(*) from product where isread = 0 ) as remindCount,(select count(*) from product ) as allRemindCount", Bind.HtmlNumber);
        },
        DbNumber2: function () {
            var today = new Date();
            var dateTime = today.getFullYear() + '-' + parseInt(today.getMonth() + 1) + '-' + today.getDate();
            YF_DB().select("select (select count(*) from product2 where addtime > '" + dateTime + "' ) as todayUpdateCount,(select count(*) from product2 where issave = 1) as collectCount,"
                            + "(select count(*) from product2 where isread = 0 ) as remindCount,(select count(*) from product2 ) as allRemindCount", Bind.HtmlNumber2);
        },
        HtmlNumber: function (rs, b) {
            if (document.getElementById("content")) {
                $("#todayUpdateCount").text(rs.rows.item(0).todayUpdateCount);
                $("#collectCount").text(rs.rows.item(0).collectCount);
                $("#allRemindCount").text(rs.rows.item(0).allRemindCount);
                if (rs.rows.item(0).allRemindCount > 300) {
                    YF_DB().del("delete from product where id < (select min(id) from(SELECT * FROM product order by id desc LIMIT 0,100))", null);
                }
            }
            Data_Local().SetBadgeText(rs.rows.item(0).remindCount.toString());
        },
        HtmlNumber2: function (rs, b) {
            if (document.getElementById("content2")) {
                $("#todayUpdateCount2").text(rs.rows.item(0).todayUpdateCount);
                $("#collectCount").text(rs.rows.item(0).collectCount);
                $("#allRemindCount").text(rs.rows.item(0).allRemindCount);
                if (rs.rows.item(0).allRemindCount > 300) {
                    YF_DB().del("delete from product where id < (select min(id) from(SELECT * FROM product order by id desc LIMIT 0,100))", null);
                }
            }
            Data_Local().SetBadgeText(rs.rows.item(0).remindCount.toString());
        },
        HtmlDom: function (rs, b) {
            if (rs && rs.rows.length > 0) {
                for (var i = 0; i < rs.rows.length; i++) {
                    if(!$("#dl" + rs.rows.item(i).id)[0]) {
                        var newHtml = '';
                        var saveHtml = '移至收藏';
                        var saveClass = 'collection';
                        if (rs.rows.item(i).isread == 0) {
                            newHtml = "<i></i>";
                        }
                        if (rs.rows.item(i).issave == 1) {
                            saveHtml = "删除";
                            saveClass = "collectionDel";
                        }
                        var itemHtml = "<dt>"
                                     + "<span><a target='_blank' href='" + rs.rows.item(i).url + "' title='" + rs.rows.item(i).subtitle + "'><img src='" + rs.rows.item(i).img + "' /></a></span></dt>"
                                     + "<dd class='tit'><a href='" + rs.rows.item(i).url + "' title='" + rs.rows.item(i).title + "'>"
                                     + newHtml + rs.rows.item(i).content + "</a></dd>"
                                     + "<dd class='time'>" + rs.rows.item(i).time + "</dd><dd class='btn'>"
                                     + "</dd>";
                        var dl = document.createElement("dl");
                        dl.id = "dl" + rs.rows.item(i).id;
                        $(dl).addClass("clearfix");
                        $(dl).html(itemHtml);
                        if (b) {
                            $("#content").prepend(dl);
                        } else {
                            $("#content").append(dl);
                        }
                    }
                }
                YF_DB().update("update product set isread = 1 where isread = 0", Bind.DbNumber);
            }
        },
        HtmlDom2: function (rs, b) {
            if (rs && rs.rows.length > 0) {
                for (var i = 0; i < rs.rows.length; i++) {
                    if(!$("#dl" + rs.rows.item(i).id)[0]){
                        var newHtml = '';
                        var saveHtml = '移至收藏';
                        var saveClass = 'collection';
                        if (rs.rows.item(i).isread == 0) {
                            newHtml = "<i></i>";
                        }
                        if (rs.rows.item(i).issave == 1) {
                            saveHtml = "删除";
                            saveClass = "collectionDel";
                        }
                        var itemHtml = "<dt>"
                                     + "<span><a target='_blank' href='" + rs.rows.item(i).url + "' title='" + rs.rows.item(i).subtitle + "'><img src='" + rs.rows.item(i).img + "' /></a></span></dt>"
                                     + "<dd class='tit'><a href='" + rs.rows.item(i).url + "' title='" + rs.rows.item(i).title + "'>"
                                     + newHtml + rs.rows.item(i).content + "</a></dd>"
                                     + "<dd class='time'>" + rs.rows.item(i).time + "</dd><dd class='btn'>"
                                     + "</dd>";
                        var dl = document.createElement("dl");
                        dl.id = "dl" + rs.rows.item(i).id;
                        $(dl).addClass("clearfix");
                        $(dl).html(itemHtml);
                        if (b) {
                            $("#content2").prepend(dl);
                        } else {
                            $("#content2").append(dl);
                        }
                    }
                }
                YF_DB().update("update product2 set isread = 1 where isread = 0", Bind.DbNumber2);
            }
        },
        options: function () {
            var YF_show = Data_Local().getLocal("YF_show") ? Data_Local().getLocal("YF_show") : "1";
            var YF_sound = Data_Local().getLocal("YF_sound") ? Data_Local().getLocal("YF_sound") : "1";
            var YF_disturb = Data_Local().getLocal("YF_disturb") ? Data_Local().getLocal("YF_disturb") : "0";
            var YF_time = Data_Local().getLocal("YF_time") ? Data_Local().getLocal("YF_time") : "30";
            var YF_category = Data_Local().getLocal("YF_category") ? Data_Local().getLocal("YF_category").split(',') : new Array();
            var YF_category_max_time = Data_Local().getLocal("YF_disturb_max_time") ? Data_Local().getLocal("YF_disturb_max_time") : "18";
            var YF_category_min_time = Data_Local().getLocal("YF_disturb_min_time") ? Data_Local().getLocal("YF_disturb_min_time") : "8";
            if (YF_show == "1") {
                $(".orRemind ul").children().first().addClass("curr").siblings().removeClass("curr");
            } else {
                $(".orRemind ul").children().last().addClass("curr").siblings().removeClass("curr");
            }
            if (YF_sound == "1") {
                $(".orSound ul").children().first().addClass("curr").siblings().removeClass("curr");
            } else {
                $(".orSound ul").children().last().addClass("curr").siblings().removeClass("curr");
            }
            if (YF_disturb == "1") {
                $(".orFaze ul").children().first().addClass("curr").siblings().removeClass("curr");
            } else {
                $(".orFaze ul").children().last().addClass("curr").siblings().removeClass("curr");
            }
            if (YF_time == "10") {
                $(".stopTime ul").children().eq(0).addClass("curr").siblings().removeClass("curr");
            } else if (YF_time == "30") {
                $(".stopTime ul").children().eq(1).addClass("curr").siblings().removeClass("curr");
            } else if (YF_time == "60") {
                $(".stopTime ul").children().eq(2).addClass("curr").siblings().removeClass("curr");
            } else if (YF_time == "120") {
                $(".stopTime ul").children().eq(3).addClass("curr").siblings().removeClass("curr");
            }
            $("#maxTime [value='" + YF_category_max_time + "']").attr("selected", "selected");
            $("#minTime [value='" + YF_category_min_time + "']").attr("selected", "selected");
            for (var i = 0; i < YF_category.length; i++) {
                if (YF_category[i] != "") {
                    $(".sortInstall dl").each(function () {
                        if ($(this).attr("msgId") == YF_category[i]) {
                            $(this).addClass("cur_on");
                        }
                    });
                }
            }
        },
        Pop: function () {
            YF_DB().select("select * from product order by id desc", Bind.HtmlDom);
            chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
                if (request.newId) {
                    YF_DB().select("select * from product where id in " + request.newId + " limit 0,100 ", Bind.HtmlDom, true);
                }
            });
            var remindCount = Data_Local().getLocal("remindCount") ? Data_Local().getLocal("remindCount") : 0;
            $("#remindCount").text(remindCount);

            YF_DB().select("select * from product2 order by id desc", Bind.HtmlDom2);
            chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
                if (request.newId) {
                    YF_DB().select("select * from product2 where id in " + request.newId + " limit 0,100 ", Bind.HtmlDom2, true);
                }
            });
            var remindCount = Data_Local().getLocal("remindCount2") ? Data_Local().getLocal("remindCount2") : 0;
            $("#remindCount2").text(remindCount);
            Data_Local().setLocal("remindCount", "0");
        }
    };
})();

var windowNoti;
if(!windowNoti){
    windowNoti=new Array();
}
if(chrome.notifications){
     chrome.notifications.onButtonClicked.addListener(function(id,i){
        for (var j = 0; j < windowNoti.length; j++) {
            if(windowNoti[j].id==id){
                chrome.tabs.create({ selected: true, url: "http://www.isaibo.com/Redirect?u=" + encodeURIComponent(windowNoti[j].shopurl) + "&f=30"});
                break;
            }
        }
    });
    chrome.notifications.onClosed.addListener(function(id,byUse){
        chrome.notifications.clear(id,function(){});
        for (var i = 0; i < windowNoti.length; i++) {
            if (id==windowNoti[i].id) {
                windowNoti.splice(i,1);
                break;
            }
        }
    });
    chrome.notifications.onClicked.addListener(function(id) {
        for (var j = 0; j < windowNoti.length; j++) {
            if(windowNoti[j].id == id){
                chrome.tabs.create({ selected: true, url: windowNoti[j].url});
                break;
            }
        }
    });
}

function GetData() {
    var start_id = Data_Local().getLocal("YF_Last_Id") ? Data_Local().getLocal("YF_Last_Id") : 0;
console.log("start_id==" + start_id);    
    Do_Html().ask(start_id, Do_Html().EvolData);
}

//这个作为接口，外部调用就可以了
function start() {
    YF_DB().create();
    var _c_bool = false;
    var _c_version = navigator.userAgent.toLowerCase().substring(navigator.userAgent.toLowerCase().indexOf("chrome") + 7).split('.')[0];
    _c_bool = parseInt(_c_version) >= 28 ? true : false;
    Data_Local().setLocal("YF_CHROME_Version", _c_bool);

    GetData();
    setInterval(GetData, 15 * 60 * 1000);
}

function playSound() {
    var audio = new Audio("../image/notify.mp3");
    audio.play();
}