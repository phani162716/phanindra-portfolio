---
permalink: /projects/
title: Projects
layout: portfolio
excerpt: "FPGA, Verilog, and ML work."
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
  </article>
  {% for item in p.work.more %}
  <article class="page-article reveal">
    <h1>{{ item.title }}</h1>
    <p>{{ item.text }}</p>
    <p>
      {% for tag in item.tags %}<span class="chip">{{ tag }}</span> {% endfor %}
    </p>
  </article>
  {% endfor %}
</main>

{% include portfolio-footer.html %}
