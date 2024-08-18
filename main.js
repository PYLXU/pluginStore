async function fetchPluginList() {
    const response = await fetch('https://raw.githubusercontent.com/PYLXU/pluginStore/main/pluginList.json');
    if (!response.ok) {
        throw new Error(`插件列表载入失败: ${response.status} ${response.statusText}（请确保您能够连接到Github）`);
    }
    return await response.json();
}

async function fetchLatestRelease(repoName) {
    const [owner, repo] = repoName.split('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`无法获取插件构建，存储库： ${repoName}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

async function fetchManifest(repoName, tag) {
    const [owner, repo] = repoName.split('/');
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${tag}/manifest.json`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch manifest.json for ${repoName}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

async function getLatestZipUrl(repoName, tag) {
    const [owner, repo] = repoName.split('/');
    const url = `https://github.com/${owner}/${repo}/archive/refs/tags/${tag}.zip`;
    return url;
}

function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

async function loadStoreData() {
    const extensionContainer = document.getElementById("extensionShopContainer");
    try {
        const plugins = await fetchPluginList();
        for (const plugin of plugins) {
            const repoName = plugin.name;
            try {
                const release = await fetchLatestRelease(repoName);
                const manifest = await fetchManifest(repoName, release.tag_name);

                const owner = repoName.split('/')[0];

                const onlinePluginList = document.createElement('div');

                onlinePluginList.innerHTML += `
                    <section>
                        <div>${manifest.uiName}</div>
                        <span>
                            <i>&#xEE59;</i> 扩展作者: ${owner}<br>
                            <i>&#xEE59;</i> 扩展包名: ${manifest.packageId}<br>
                            <i>&#xEE51;</i> 扩展版本: ${release.tag_name}<br>
                        </span>
                    </section>
                    <button class="sub" onclick="alert('${getLatestZipUrl(repoName, release.tag_name)}')">安装</button>
            `;
                extensionContainer.appendChild(onlinePluginList);

            } catch (error) {
                const errorDisplay = document.createElement('div');
                errorDisplay.innerHTML += `
                    <section>
                        <div>载入这个插件时出现了错误</div>
                        <span>
                            <i>&#xEB97;</i> 错误详情: ${error}<br>
                        </span>
                    </section>
                    <button class="sub" disabled>安装</button>
            `;
                extensionContainer.appendChild(errorDisplay);
            }
        }

    } catch (error) {
        const errorDisplay = document.createElement('div');
        errorDisplay.innerHTML += `
            <section>
                <div>载入在线列表时出现了错误</div>
                <span>
                    <i>&#xEB97;</i> 错误详情: ${error}<br>
                </span>
            </section>
            <button class="sub" disabled>安装</button>
    `;
        extensionContainer.appendChild(errorDisplay);
    }

}

function includeStyleElement(styles, styleId) {
    if (document.getElementById(styleId)) {
        return
    }
    var style = document.createElement("style");
    style.id = styleId;
    (document.getElementsByTagName("head")[0] || document.body).appendChild(style);
    if (style.styleSheet) {
        style.styleSheet.cssText = styles;
    } else {
        style.appendChild(document.createTextNode(styles));
    }
}

var styles = `
.right #extensionShopPage #extensionShopContainer{
    position: absolute;
    z-index: 1;
    padding: 70px 27.5px 100px 27.5px;
    padding-top: 90px !important;
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}
.right #extensionShopPage #extensionShopContainer>div {
    background: white;
    width: 100%;
    border-radius: 5px;
    margin-bottom: 5px;
    padding: 10px 15px;
    display: flex;
    align-items: center;
}
.right #extensionShopPage #extensionShopContainer>div section {
    width: 100%;
    margin-right: 10px;
}
.right #extensionShopPage #extensionShopContainer>div section div {
    font-size: 1em;
}
.right #extensionShopPage #extensionShopContainer>div section span {
    display: block;
    font-size: .9em;
    opacity: .8;
    word-break: break-all;
    line-height: 1.1em;
    margin-top: 3px;
}
.right #extensionShopPage #extensionShopContainer button {
    white-space: nowrap;
}
`;
includeStyleElement(styles, "extensionShopPageCSS");

// 置入左栏商店按钮

var pluginShopButton = document.createElement("div");

pluginShopButton.setAttribute("data-page-id", "extensionShopPage");
pluginShopButton.setAttribute("onclick", "switchRightPage('extensionShopPage')");

pluginShopButton.innerHTML = '<i></i> 商店';

var leftBar = document.getElementsByClassName("leftBar")[0];
leftBar.appendChild(pluginShopButton);

// 置入右栏商店页面

var extensionShopPage = document.createElement("div");

extensionShopPage.setAttribute("id", "extensionShopPage");
extensionShopPage.setAttribute("hidden", "");
extensionShopPage.classList.add("page");

extensionShopPage.innerHTML = `<div class="header">
						<i></i> 扩展商店
					</div>
                    <div id="extensionShopContainer"></div>`;

var Right = document.getElementsByClassName("right")[0];
Right.appendChild(extensionShopPage);

loadStoreData();