#!/usr/bin/env python3
"""Собирает src/* в один самодостаточный index.html (без сети и сервера)."""
import pathlib
src = pathlib.Path(__file__).parent / "src"
rd = lambda n: (src / n).read_text(encoding="utf8")
js = "\n".join(rd(n) for n in ["i18n.js", "data.js", "core.js", "anatomy.js", "ui.js", "mission.js", "anat3d.js", "avatar.js", "colony.js"])
html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Внутренний климат</title>
<style>
{rd("styles.css")}</style>
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
{rd("crew/crew.css")}</style>
</head>
<body>
{rd("crew/body.html")}<script>
{rd("vendor/three.min.js")}</script>
<script>
{rd("anat3d.js")}
{rd("crew/crew.js")}</script>
</body>
</html>
"""
(pathlib.Path(__file__).parent / "crew.html").write_text(crew, encoding="utf8")
print(f"crew.html: {len(crew.encode('utf8'))//1024} KB")
