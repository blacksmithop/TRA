# Torn Revive

[![Docker Build](https://img.shields.io/github/actions/workflow/status/blacksmithop/TRA/docker-image.yml?branch=main&style=for-the-badge&logo=docker&label=Docker%20Image&color=%23007BFF)](https://github.com/blacksmithop/TRA/actions/workflows/docker-image.yml) [![Github Pages](https://img.shields.io/github/actions/workflow/status/blacksmithop/TRA/gh-pages.yml?branch=main&style=for-the-badge&logo=nextdotjs&label=Website)](https://github.com/blacksmithop/TRA/actions/workflows/gh-pages.yml) 
---

[Credits](./docs/Credits.md)

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Torn API Login | ✅ | Secure login with your custom Torn API key |
| Revive Statistics | ✅ | Track total revives, success rates & trends |
| Revives Table | ✅ | Complete revive history with search & filters |
| Excel Export | ✅ | Download filtered data as Excel spreadsheet |
| Success Calculator | ✅ | Predict revive success based on skills & target |
| Cost Breakdown | ✅ | Compare energy source costs (hospital/nurse/etc.) |

---

## Quick Start

Clone the repo

```bash
# Clone the repo
git clone https://github.com/blacksmithop/TRA.git
cd TRA
```

Build the image

```bash
make build
```

Run the app

```bash
make run
```

Visit [http://localhost:3000](http://localhost:3000)

Shutdown with

```bash
make down
```