#!/usr/bin/env python3
"""Собирает src/* в один самодостаточный index.html (без сети и сервера)."""
import pathlib
src = pathlib.Path(__file__).parent / "src"
rd = lambda n: (src / n).read_text(encoding="utf8")
atlas = rd("atlas.js").replace("/*NAMES*/{}", rd("atlas_names.json"))
js = "\n".join(rd(n) if n!="atlas.js" else atlas for n in ["i18n.js", "data.js", "core.js", "anatomy.js", "ui.js", "mission.js", "anat3d.js", "atlas.js", "avatar.js", "colony3d.js", "fx.js", "games.js", "hero.js", "family.js", "player.js", "colmap.js", "colony.js"])
html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Внутренний климат</title>
<style>
{rd("styles.css")}{rd("atlas.css")}{rd("fonts.css")}{rd("theme.css")}{rd("wellness.css")}</style>
</head>
<body>
{rd("body.html")}<script>
{rd("vendor/three.min.js")}</script>
<script>
{js}</script>
</body>
</html>
"""
out = pathlib.Path(__file__).parent / "index.html"
out.write_text(html, encoding="utf8")
print(f"index.html: {len(html.encode('utf8'))//1024} KB")

# сайт экипажа «Орбита»
crew = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Орбита: здоровье экипажа</title>
<style>
{rd("crew/crew.css")}{rd("atlas.css")}{rd("fonts.css")}{rd("theme.css")}</style>
</head>
<body>
{rd("crew/body.html")}<script>
{rd("vendor/three.min.js")}</script>
<script>
{rd("anat3d.js")}
{atlas}
{rd("fx.js")}
{rd("crew/crew.js")}
{rd("player.js")}</script>
</body>
</html>
"""
(pathlib.Path(__file__).parent / "crew.html").write_text(crew, encoding="utf8")
print(f"crew.html: {len(crew.encode('utf8'))//1024} KB")
