+++
date = '{{ .Date }}'
created = '{{ .Date }}'
published = '{{ .Date }}'
draft = true
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
+++