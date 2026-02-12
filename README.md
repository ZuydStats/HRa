# Deployment Notes

## 1. Create GitHub repo

Create an empty repository on GitHub, then run:

```bash
git init
git add .
git commit -m "Initial statistics wiki scaffold"
git branch -M main
git remote add origin https://github.com/<your-github-username>/<your-repo-name>.git
git push -u origin main
```

## 2. Enable GitHub Pages

In GitHub repo settings:

- Go to **Settings -> Pages**
- Under **Build and deployment**, set **Source = GitHub Actions**

The included workflow `.github/workflows/deploy.yml` will publish automatically on every push to `main`.

## 3. Set correct URL in mkdocs.yml

Update:

- `site_url`
- `repo_url`
- `repo_name`

## 4. Local preview

```bash
pip install -r requirements.txt
mkdocs serve
```

## 5. Optional graded quizzes

For graded quizzes, link out from each session to Moodle/Canvas/Microsoft Forms.
