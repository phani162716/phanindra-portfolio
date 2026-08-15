---
permalink: /projects/
title: Projects
layout: portfolio
excerpt: "Projects — edit _data/profile.yml"
---
{%- assign p = site.data.profile -%}
{% include portfolio-nav.html %}

<main id="main" class="pf-wrap">
  <article class="page-article reveal">
    <p class="kicker">{{ p.work.kicker }}</p>
    <h1>{{ p.work.featured.title }}</h1>
    <p>{{ p.work.featured.text }}</p>
    <p>
      {% for tag in p.work.featured.tags %}<span class="chip">{{ tag }}</span> {% endfor %}
    </p>
    <p><a class="btn-3d" href="{{ p.work.featured.repo }}">Open repo</a></p>
  </article>
</main>

{% include portfolio-footer.html %}
