const { DateTime } = require("luxon");
module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "public/assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "src/assets"});

    eleventyConfig.addCollection("blog", function (collectionApi) {
        return collectionApi.getFilteredByTag("blog");
    });


    // 摘要短代码
    eleventyConfig.setFrontMatterParsingOptions({
        excerpt: true,
        excerpt_separator: "<!-- readmore -->",
    });


    eleventyConfig.addFilter("date", (value, format = "yyyy-MM-dd") => {
        if (!(value instanceof Date)) {
            return "Invalid Date";
        }
        return DateTime.fromJSDate(value, { zone: "utc" }).toFormat(format);
    });

    // tag页面生成
    eleventyConfig.addCollection("tagList", function(collectionApi) {
        const tagSet = new Set();
        collectionApi.getAll().forEach(item => {
          (item.data.tags || []).forEach(tag => {
            if (tag !== "blog") tagSet.add(tag);
          });
        });
        return [...tagSet];
      });
    


    return {
        pathPrefix: "/voidhead-new/",
        dir: {
            input: "src",
            includes: "_includes",
            output: "docs",
        }

    };

}