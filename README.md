# 3D portfolio

UI and 3D background are done. After you deploy, **only edit your information** — do not touch the layout.

## After deploy — edit your info here

Open **`_data/profile.yml`** and replace the placeholder text:

- name, intro, GitHub, email, LinkedIn
- stats, cube faces
- about, education, skills, project, contact

Then commit and push. The homepage, About, and Projects all read from that one file.

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

http://127.0.0.1:4000/minimal-mistakes/

## Do not need to edit

| File | Role |
| --- | --- |
| `assets/css/portfolio.css` | UI |
| `assets/js/portfolio-3d.js` | 3D background |
| `_layouts/portfolio.html` | Shell |
| `index.html` | Structure only |
