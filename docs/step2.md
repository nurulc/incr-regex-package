#### Previous step

<img src="regex-graph-2.svg" width="400">

#### Step2 match char __'2'__

Each of the paths __pos1__, __pos2__, and __pos3__ require that we match a character, since we are trying to match ___"d2-"__

- [x] __pos1__ will try to match __'2'__ against _[0-9]_, that will match so we keep this path <image src="https://upload.wikimedia.org/wikipedia/commons//e/ef/Thumbs_up_font_awesome.svg" height="20px">
- [ ] __pos2__ will try to match __'2'__ against _o_, that will fail to match so we drop this path <image src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Thumbs_down_font_awesome.svg" height="20px">

![](regex-graph-3.svg)

[Next Step 3](step3.md)
