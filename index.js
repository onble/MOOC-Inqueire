// datas存储被读取数据文件中的数组数据
var datas = null;
// choose_data存储被读取数据文件的文件名字
var choose_data = undefined;
// 今天的日期时间类
const today_time = new Date();

// 渲染数据的模块
(function () {
    // 获取数据模块

    db.forEach((element) => {
        // 根据parms.js文件的db参数获取所有的数据文件，并调用函数渲染到页面上

        const js = document.createElement("script");
        js.src = `./course_${element}.js`;
        document.body.appendChild(js);
        js.onload = js.onreadystatechange = function () {
            if (
                !this.readyState ||
                this.readyState == "loaded" ||
                this.readyState == "complete"
            ) {
                add_data2nav(element);
            }
            js.onload = js.onreadystatechange = null;
        };
    });
    function add_data2nav(data_name) {
        // 将新获取的数据都添加到搜索框右边的列表中

        // 获取nav
        const nav = document.querySelector("#search_box>nav>ul");
        const li = document.createElement("li");
        li.innerHTML = data_name;
        if (nav.childNodes.length == 0) {
            // 进行默认配置
            li.classList.add("choose");
            li.classList.add("using");
            datas = eval(`datas_${data_name}`);
            choose_data = data_name;
        }
        nav.appendChild(li);
        li.addEventListener("click", function () {
            if (!li.classList.contains("choose")) {
                // 移除其他的
                nav.childNodes.forEach((element) => {
                    element.classList.remove("choose");
                });
                li.classList.add("choose");
                choose_data = li.innerHTML;
            }
        });
    }
})();

// 工具函数
function clearbox(box) {
    // 清除一个盒子中的所有子节点

    const childs = box.childNodes;
    for (i = childs.length - 1; i >= 0; i--) {
        box.removeChild(childs[i]);
    }
}
function search_back2normal() {
    // 将搜索框恢复到正常状态
    // 更改下面的圆角
    // 隐藏ul

    // 获取搜索框盒子
    const search_box = document.querySelector("#search_box");
    // 获取ul节点
    const ul = document.querySelector("#search_box>form>article>ul");
    // 更改input框和ul的显示状态的状态
    search_box.classList.remove("return");
    ul.parentElement.style.display = "none";
}
Date.prototype.format = function (fmt) {
    // 给Date类添加一个format函数来方便进行将日期格式化

    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
            RegExp.$1,
            (this.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return fmt;
};
function search_word2webpage(word) {
    // 根据搜索词来更新页面

    // 获取格式更新按钮
    const button_collation = document.querySelector(
        "body > div#center > nav > form > table>tfoot>tr>th>mark"
    );

    // 获取课程状态
    function get_class_status(select) {
        const time_open = new Date(parseInt(select[10]));
        const time_close = new Date(parseInt(select[11]));
        if (time_open < today_time) {
            if (today_time < time_close) {
                return "doing";
            } else {
                // 此时课程已经结束
                // 判断closeVisableStatus参数
                if (select[17] == "0") {
                    // 可以自学
                    return "learn";
                } else {
                    return "close";
                }
            }
        } else {
            return "waiting";
        }
    }
    function render_class_inf(select, page = 0, select_raw = []) {
        // 将课程的信息渲染到页面上

        function class_status(status, time_open, time_close) {
            // 生成关于课程状态的HTML代码

            if (time_open < today_time) {
                if (today_time < time_close) {
                    // 此时课程正在进行
                    return `<div class="class_status green">当前课程状态:<span>进行到第${Math.ceil(
                        (today_time - time_open) / 604800000
                    )}周</span></div>`;
                } else {
                    // 此时课程已经结束
                    // 判断closeVisableStatus参数
                    if (status == "0") {
                        return `<div class="class_status yellow">当前课程状态:<span>课程已结束，可以自学</span></div>`;
                    } else {
                        return `<div class="class_status red">当前课程状态:<span>课程已关闭</span></div>`;
                    }
                }
            } else {
                // 此时未开课,可以报名等待
                return `<div class="class_status orange">当前课程状态:<span>课程天${Math.ceil(
                    (time_open - today_time) / 86400000
                )}后开始</span></div>`;
            }
        }
        function class_tag(course) {
            if (course[20] == "null") {
                return ``;
            } else {
                return `<cite>${JSON.parse(course[20]).name}</cite>`;
            }
        }
        function render_page_num(page, all_pages) {
            // 绘制页码导航
            // page变量从0开始计数
            // all_pages变量为总页码,真正的总数，用30除出来的
            // TODO:这个函数可以进行柯里化

            function click_page_num(element) {
                innerHTML = element.innerHTML;
                const now_page_li = document.querySelector(
                    "body > article > nav > ul > li.current"
                );
                const now_page = parseInt(now_page_li.innerHTML);
                if (innerHTML == "下一页") {
                    if (element.classList.contains("forbid")) {
                        return;
                    } else {
                        render_class_inf(select, (page = now_page));
                    }
                } else if (innerHTML == "上一页") {
                    if (element.classList.contains("forbid")) {
                        return;
                    } else {
                        render_class_inf(select, (page = now_page - 2));
                    }
                } else if (
                    !element.classList.contains("symbol") &&
                    !element.classList.contains("current")
                ) {
                    render_class_inf(
                        select,
                        (page = parseInt(element.innerHTML) - 1)
                    );
                    return;
                }
            }
            // 获取盒子
            const box = document.querySelector("body > article > nav > ul");
            clearbox(box);
            let innerHTML = ``;
            // 增加上一页
            if (page > 0) {
                // 说明有上一页
                innerHTML = innerHTML + `<li>上一页</li>`;
            } else {
                // 说明没有上一页
                innerHTML = innerHTML + `<li class="forbid">上一页</li>`;
            }
            // 如果页码小于等于9
            if (all_pages <= 9) {
                for (i = 0; i < all_pages; i++) {
                    if (i == page) {
                        // 绘制自己选中的页码
                        innerHTML =
                            innerHTML + `<li class="current">${page + 1}</li>`;
                        continue;
                    }
                    innerHTML = innerHTML + `<li>${i + 1}</li>`;
                }
            } else {
                let right_page = 3;
                let left_page = 3;
                let j = page - 3;
                // 当页码较小的情况下
                if (page < 5) {
                    j = 0;
                    right_page = right_page + (4 - page);
                    left_page = page;
                } else {
                    if (all_pages - (page + 1) >= 4) {
                        // 完全正常两边都有省略号
                        innerHTML = innerHTML + `<li>1</li>`;
                        innerHTML = innerHTML + `<li class="symbol">...</li>`;
                    } else {
                        // 从左边补上缺的
                        left_page = left_page + (4 - (all_pages - (page + 1)));
                        if (page - left_page > 0) {
                            innerHTML = innerHTML + `<li>1</li>`;
                            innerHTML =
                                innerHTML + `<li class="symbol">...</li>`;
                            // left_page = left_page;
                            j = page - left_page;
                        }
                    }
                }

                // 绘制左边的
                for (i = 0; i < left_page; i++, j++) {
                    innerHTML = innerHTML + `<li>${j + 1}</li>`;
                }

                // 绘制自己选中的页码
                innerHTML = innerHTML + `<li class="current">${page + 1}</li>`;

                // 绘制右边
                for (i = 1; i <= right_page; i++) {
                    if (page + i < all_pages) {
                        innerHTML = innerHTML + `<li>${page + i + 1}</li>`;
                    } else {
                        break;
                    }
                }
                if (all_pages - (page + 1) > 4) {
                    innerHTML = innerHTML + `<li class="symbol">...</li>`;
                    innerHTML = innerHTML + `<li>${all_pages}</li>`;
                } else if (all_pages - (page + 1) == 4) {
                    innerHTML = innerHTML + `<li>${all_pages}</li>`;
                }
            }

            // 增加下一页
            if (all_pages - 1 > page) {
                // 说明有下一页
                innerHTML = innerHTML + `<li>下一页</li>`;
            } else {
                // 说明没有下一页
                innerHTML = innerHTML + `<li class="forbid">下一页</li>`;
            }
            box.innerHTML = innerHTML;
            // 下面给每一个li添加点击事件
            box.childNodes.forEach((element) => {
                element.addEventListener("click", function () {
                    click_page_num(element);
                });
            });
        }
        // 获取对应盒子
        const box = document.querySelector("body>article>main");
        // 清空盒子
        clearbox(box);
        // 清空页码
        clearbox(document.querySelector("body > article > nav > ul"));
        // 获取下面的footer
        const footer = document.querySelector("body>article>footer");
        if (select.length == 0) {
            // 此时select为空元素
            // 将下面的隐藏显示出来
            footer.style.display = "block";
            if (select_raw.length == 0) {
                // 给数据重新排序按钮增加禁止类
                button_collation.classList.add("forbid");
                footer.innerHTML = `<i class="fa fa-binoculars" aria-hidden="true"></i>当前无结果，请更换检索词!`;
            } else {
                footer.innerHTML = `<i class="fa fa-binoculars" aria-hidden="true"></i>当前无结果，请更换检索条件!`;
            }

            return;
        } else {
            footer.style.display = "none";
            // 给格式更新按钮移除禁止类
            button_collation.classList.remove("forbid");
        }
        for (i = 30 * page; i < 30 * page + 30; i++) {
            if (select[i]) {
                // 绘制数据
                const section = document.createElement("section");
                const time_open = new Date(parseInt(select[i][10]));
                const time_close = new Date(parseInt(select[i][11]));
                section.innerHTML = `
                <a href="https://www.icourse163.org/course/${select[i][8]}-${
                    select[i][0]
                }">
                    <div>
                        <img
                            src="${select[i][2]}"
                            alt=""
                        />
                    </div>
                    <h4>${select[i][1]}</h4>
                </a>
                <div class="school_name">学校:<span><a href="https://www.icourse163.org/university/${
                    select[i][8]
                }">${select[i][7]}</a></span></div>
                <div class="peoples">订阅人数:<span>${select[i][3]}</span></div>
                <div>开课时间:<span>${time_open.format(
                    "yyyy-MM-dd hh:mm:ss"
                )}</span></div>
                <div>结课时间:<span>${time_close.format(
                    "yyyy-MM-dd hh:mm:ss"
                )}</span></div>
                <div>任课教师:<span>${select[i][5]}</span></div>
                <div>课程周数:<span>${Math.ceil(
                    (time_close - time_open) / 604800000
                )}周</span></div>
                ${class_status(select[i][17], time_open, time_close)}
                ${class_tag(select[i])}`;
                box.appendChild(section);
            }
        }
        render_page_num(page, Math.ceil(select.length / 30));
    }
    function update_select_collation(select) {
        // 更新select的排序方式

        // 获取表单
        const form = document.forms["collation"];
        // 获取课程名字的排序方式
        if (form["class_name"].value === "up") {
            select = select.sort((a, b) => {
                return a[1].localeCompare(b[1]);
            });
        } else if (form["class_name"].value === "down") {
            select = select.sort((a, b) => {
                return -a[1].localeCompare(b[1]);
            });
        }
        if (form["people_num"].value === "up") {
            select = select.sort((a, b) => {
                return parseInt(a[3]) > parseInt(b[3]) ? 1 : -1;
            });
        } else if (form["people_num"].value === "down") {
            select = select.sort((a, b) => {
                // 降序
                return parseInt(a[3]) > parseInt(b[3]) ? -1 : 1;
            });
        }
        if (form["open_time"].value === "up") {
            select = select.sort((a, b) => {
                return parseInt(a[10]) > parseInt(b[10]) ? 1 : -1;
            });
        } else if (form["open_time"].value === "down") {
            select = select.sort((a, b) => {
                return parseInt(a[10]) > parseInt(b[10]) ? -1 : 1;
            });
        }
        if (form["close_time"].value === "up") {
            select = select.sort((a, b) => {
                return parseInt(a[11]) > parseInt(b[11]) ? 1 : -1;
            });
        } else if (form["close_time"].value === "down") {
            select = select.sort((a, b) => {
                return parseInt(a[11]) > parseInt(b[11]) ? -1 : 1;
            });
        }
        if (form["teacher_name"].value === "up") {
            select = select.sort((a, b) => {
                return a[5].localeCompare(b[5]);
            });
        } else if (form["teacher_name"].value === "down") {
            select = select.sort((a, b) => {
                return -a[5].localeCompare(b[5]);
            });
        }
        if (form["school_name"].value === "up") {
            select = select.sort((a, b) => {
                return a[7].localeCompare(b[7]);
            });
        } else if (form["school_name"].value === "down") {
            select = select.sort((a, b) => {
                return -a[7].localeCompare(b[7]);
            });
        }
        if (!form["doing"].checked) {
            // 不要正在进行的

            select = select.filter((element) => {
                if (get_class_status(element) === "doing") {
                    return false;
                } else {
                    return true;
                }
            });
        }
        if (!form["waiting"].checked) {
            // 不要等待开课的

            select = select.filter((element) => {
                if (get_class_status(element) === "waiting") {
                    return false;
                } else {
                    return true;
                }
            });
        }
        if (!form["learn"].checked) {
            // 不要可以自学的

            select = select.filter((element) => {
                if (get_class_status(element) === "learn") {
                    return false;
                } else {
                    return true;
                }
            });
        }
        if (!form["close"].checked) {
            // 不要关闭的

            select = select.filter((element) => {
                if (get_class_status(element) === "close") {
                    return false;
                } else {
                    return true;
                }
            });
        }
        return select;
    }

    // 首先判断输入值，为空直接返回
    if (word == "") {
        return;
    }
    // 如果datas 未加载
    if (datas.length == 0) {
        console.warn("数据未加载");
        return;
    }
    // 在检索前检查是否需要更换数据源
    const using_data_li = document.querySelector("#search_box>nav>ul>li.using");
    if (using_data_li.innerHTML == choose_data) {
        // 什么也不用作
    } else {
        // 更新数据源
        datas = eval(`datas_${choose_data}`);
        // 将原来的li的类删除
        using_data_li.classList.remove("using");
        // 给现在选中的li增加using类
        const choose_data_li = document.querySelector(
            "#search_box>nav>ul>li.choose"
        );
        choose_data_li.classList.add("using");
    }
    // 获取h3标题元素
    const h3 = document.querySelector("body>article>h3");
    h3.innerHTML = `"${word}"的搜索结果`;
    // 按照输入框内作为关键词去拿筛选后的结果
    let select = [];
    let select2show = [];
    const regex = new RegExp(word, "gi");
    for (i in datas) {
        // 跳过第一个数据
        if (i == 0) {
            continue;
        }
        if (datas[i][1].match(regex)) {
            select.push(datas[i]);
        }
    }

    // 下面是将数据进行清洗
    select2show = update_select_collation(select);
    // 调取函数，将数据展示在页面上
    render_class_inf(select2show, 0, select);
    // 清空输入框
    inupt_search.value = "";
    search_back2normal();

    // 给格式更新按钮的点击事件更新
    button_collation.onclick = function () {
        select2show = update_select_collation(select);
        // 调取函数，将数据展示在页面上
        render_class_inf(select2show, 0, select);
    };
}

// 临时存放的函数

// 给搜索框添加事件
const inupt_search = document.querySelector("#search_box input");
inupt_search.addEventListener("input", function () {
    // 获取ul节点
    const ul = document.querySelector("#search_box>form>article>ul");
    // 清空ul节点
    clearbox(ul);
    // 获取搜索框盒子
    const search_box = document.querySelector("#search_box");
    if (inupt_search.value == "") {
        search_back2normal();
        return;
    }
    ul.parentElement.style.display = "block";
    search_box.classList.add("return");
    const regex = new RegExp(inupt_search.value, "gi");
    // 准备存放返回数据的容器
    let answer = {};
    let answer_max_7 = {};
    // 去datas里面获取数据
    // 如果datas 未加载
    if (datas.length == 0) {
        console.log("数据未加载");
        return;
    }
    for (let i in datas) {
        // 跳过第一个数据
        if (i == 0) {
            continue;
        }
        if (datas[i][1].match(regex)) {
            // console.log(datas[i][1]);
            if (answer[datas[i][1]] == undefined) {
                answer[datas[i][1]] = 1;
            } else {
                answer[datas[i][1]]++;
            }
        }
    }
    for (i = 0; i < 7; i++) {
        let max_num = 0;
        let max_item = undefined;
        for (j in answer) {
            if (answer[j] > max_num) {
                max_num = answer[j];
                max_item = j;
            }
        }
        if (answer_max_7[max_item] == undefined && max_item != undefined) {
            answer_max_7[max_item] = max_num;
            answer[max_item] = -1;
        }
    }
    // 判断anser_max_是不是空的
    if (Object.keys(answer_max_7).length === 0) {
        search_back2normal();
    }
    for (i in answer_max_7) {
        // 将元素依次添加到到ul中
        const li = document.createElement("li");
        li.innerHTML = `<span>${i}</span><mark>${answer_max_7[i]}</mark>`;
        ul.appendChild(li);
        // 给li增加点击事件
        li.addEventListener("click", function () {
            const span = li.children.item(0);
            // 将课程名字传给渲染函数
            search_word2webpage(span.innerHTML);
        });
    }
});
inupt_search.addEventListener("keypress", function (event) {
    if (event.keyCode == 13) {
        search_word2webpage(inupt_search.value);
    }
});
// 给搜索框右边的按钮添加点击事件
const search_button = document.querySelector(
    "#search_box>form>div>div:last-child"
);
search_button.addEventListener("click", function () {
    search_word2webpage(inupt_search.value);
});
