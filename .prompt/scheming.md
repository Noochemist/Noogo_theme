> using trae seed_code

## 设计调研阶段
我要做一个Hugo主题。这个主题包含五种不同的社交网站的风格，小红书、知乎、公众号、Medium和Quora。

不同的风格可以在主题文件夹下的hugo.toml配置文件中修改参数指定。

主题还要包含一些其他重要特性，这些特性可以参见文件 .prompt/ref/feature_6themes_summary.md

当有必要时，一些特性同样可以通过参数在主题文件夹下的hugo点toml中配置，比如网站的字体，设置导航字体、正文字体、标题字体等。

SPA这一特性通过swup实现。

所编写的代码应当模块化，各种特性的实现放入不同的文件，不管是CSS文件还是JS文件，都确保功能明确、清晰易读。

同时各种特性之间实现业务隔离，比如响应式布局的特性和更换不同社交网站风格的特性应当是隔离的，互不相关的。可以独立开发和修改。

给出实现思路以及实现顺序，用到的技术方案等，把调研结果创建成文件，放到.prompt/scheming文件夹下。

同时创建一个主题文件夹下的Hugo.toml配置文件，把适当的配置项写入其中，这个文件同样放到.prompt/scheming文件夹下。

### 部分修正

Research.md当中给出了项目的目录：
├── _default/
│   ├── single.html     
│   ├── list.html     
│   ├── home.html     
│   └── taxonomy.html

这是旧版本的目录结构，新版本里面已经去掉了_default文件夹，模板文件都放在 layouts 目录下。

模板文件包括baseof、 home、page、 taxonomy和term。5种文件。single.html 和 list.html 只是默认的fallback，尽量不使用。
根据以上修正调研的两个文件。

### 补充
导航页的按钮可以由用户直接在hugo.toml里通过参数设置，动态的加载。比如用户设置了一个“项目”，那么导航就应该有一个项目的按钮。

默认的导航按钮包括：Home Posts Collects Recommends Projects About，的中文目录名称为首页、文章、合集、推荐、项目、关于。

archetypes/default.md 当中，日期应当包含发表日期和撰写日期。发表日期，Hugo有专门的 published 作为Front Matter变量。撰写日期可以用 wrote，或者你认为更合适的变量名。

根据以上修正调研的文件。

### 修正
[taxonomies]
  category   = "categories"
  tag        = "tags"
  author     = "authors"
  collection = "collections"
  recommend  = "recommends"
  project    = "projects"
  
上一轮补充提到：
默认的导航按钮包括：Home Posts Collects Recommends Projects About，的中文目录名称为首页、文章、合集、推荐、项目、关于。

我的意图没有表达明确。我是想这些目录是在exampleSite/content文件夹下面的一级文件夹。不是 Taxonomy，在主题当中不应当出现，因此把Hugo.toml文件当中的Taxonomy的设置去掉，用默认就可以。而配置文件当中设置相应的目录可以只保留Home、Posts和About，其它项，项目、推荐、合集的设置可以注释掉，方便启用就可以。

### 修正

在 https://gohugo.io/configuration/taxonomies/ 里面提到 The default configuration defines two taxonomies, categories and tags.

[taxonomies]
  category = 'categories'
  tag = 'tags'
因此， author不是一个默认的taxonomy。修正调研配置文件。

### 问题

一个问题，在research.md的目录结构中， spa/ 接放在 assets/js/ 文件夹下，而不是在 features/下面。这样设计的原因是什么？是因为SPA和这些Features有不同的逻辑结构，还是仅仅因为我提到了这一个特性而专门处理了呢？ 