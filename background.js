const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] =
                i === 0
                    ? j
                    : Math.min(
                          arr[i - 1][j] + 1,
                          arr[i][j - 1] + 1,
                          arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                      );
        }
    }
    return arr[t.length][s.length];
};

// videos from json
let videos;
fetch(browser.runtime.getURL("videos.json"))
    .then((response) => response.json())
    .then((data) => {
        console.log("loaded videos");
        videos = data;
        // Handle the JSON data here
    })
    .catch((error) => {
        console.error("Error fetching the JSON file:", error);
    });

// Create a context menu item
browser.contextMenus.create(
    {
        id: "lookup-word",
        title: "Search ASL Sign",
        contexts: ["selection"],
    },
    () => {
        if (browser.runtime.lastError) {
            console.error(browser.runtime.lastError);
        } else {
            console.log("Context menu item created");
        }
    }
);

// Add a listener for the context menu click
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lookup-word" && info.selectionText) {
        searchword = info.selectionText
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\-]/g, "");

        console.log(searchword);

        titles = [];
        for (let video of videos) {
            titles.push(video.title.toLowerCase());
        }

        finds = [];
        for (video of videos) {
            t = video.title
                .toLowerCase()
                .split(/[^a-zA-Z0-9\-]/g)
                .filter((x) =>
                    x
                        .replace(/[^a-zA-Z0-9\-]/g, "")
                        .replace(/[^a-zA-Z0-9]$/g, "")
                );
            if (t.includes(searchword)) {
                console.log(t);

                finds.push(video);
            }
            // if (
            //     video.title
            //         .toLowerCase()
            //         .split(/[\s\-]/g)
            //         .includes(searchword.toLowerCase())
            // ) {
            //     finds.push(video);
            // }
        }

        best = finds[0];
        for (find of finds) {
            if (find.title.length < best.title.length) {
                best = find;
            }
        }

        console.log(finds);

        if (best) {
            browser.tabs.create({ url: best.url });
            return;
        }

        console.log(titles);
        if (titles.includes(searchword.toLowerCase())) {
            for (video of videos) {
                if (video.title.toLowerCase() === searchword.toLowerCase()) {
                    browser.tabs.create({ url: video.url });
                    return;
                }
            }
        }

        // if not exact match find
        min = 100000;
        minIndex = 0;

        for (let i = 0; i < titles.length; i++) {
            distance = levenshteinDistance(searchword, titles[i]);
            if (distance < min) {
                min = distance;
                minIndex = i;
            }
        }

        browser.tabs.create({ url: videos[minIndex].url });
    }
});
