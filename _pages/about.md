---
permalink: /about/
title: About
layout: portfolio
excerpt: "About — edit _data/profile.yml"
---
{%- assign p = site.data.profile -%}
{% include portfolio-nav.html %}

<main id="main" class="pf-wrap">
  <article class="page-article reveal">
    <p class="kicker">{{ p.about.kicker }}</p>
    <h1>{{ p.name_first }} {{ p.name_last }}</h1>
    {% for para in p.about.paragraphs %}
    <p>{{ para }}</p>
    {% endfor %}
    <ul>
      {% for fact in p.about.facts %}
      <li><strong>{{ fact.label }}</strong> — {{ fact.value }}</li>
      {% endfor %}
    </ul>
  </article>
</main>

{% include portfolio-footer.html %}
