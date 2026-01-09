---
title: 如何境内外分流同时使用ESA,EdgeOne,Cloudflare CDN
published: 2026-01-09 20:54:05
description: 为你的网站优化线路
image: ./images/effect.avif
tags:
  - 技术
  - 建站经验
category: 技术交流
draft: false
---

## 前言与准备

在建站时，为了在全球可用区都获得最快的访问速度和防止被打死，我们显然不能直接只用EdgeOne / ESA / Clouflare 其中一家的CDN。  
而是应该使用DNS策略将用户流量按地区分流到不同的CDN  
以下为Server(有源站)和Serverless(Pages or Workers)的配置教程。  
### 源站接入
源站配置方式需要两个顶级域名，访问域名和中转域名  
访问域(如 [blog.yaooa.cn](https://blog.yaooa.cn))托管在支持GeoDNS(按地理位置解析)的DNS服务提供商，例如阿里云云解析DNS,腾讯DNSPod等等。  

中转域名托管在CloudFlare(没有去买个几块钱一年的xyz就行)
### Pages接入
Pages一个访问域名就行

## 源站 / Pages 配置

### 源站方式接入（适用于你有后端,例如Halo,WordPress）

先确保你的网站能正常访问，然后将中转域名解析到源站IP地址（开启CloudFlare小黄云），如图
![CloudFlare设置](./images/cfyunsett.avif)

接下来前往来到 `SSL/TLS -> 自定义主机名` 中，设置回退源，首次使用需要先订阅 Cloudflare for SaaS 功能  
Cloudflare for SaaS 功能本身是免费的，100 个自定义主机头以内的费用都是 0 元，但订阅该功能需要 Cloudflare 账号绑定支付方式（可以绑定Paypal,visa/mc卡等等） 
回退源填写刚刚设置的中转域名，然后点击添加自定义主机名，如图
![自定义主机名设置](./images/cfsaasfall.avif)
自定义主机名填写你的访问域名，如图
![自定义主机名配置](./images/cushost.avif)
然后CloudFlare会提示你需要添加两条TXT记录分别用来验证域名所有权和证书颁发，照着添加即可
### Pages方式配置
先将你的Pages推送到Github仓库或受支持的其他平台，在EdgeOne,ESA,CloudFlare中点击对应的入口一步一步操作即可，这里不过多叙述

- [EdgeOne Pages 入口](https://console.cloud.tencent.com/edgeone/pages)
- [ESA Pages入口](https://esa.console.aliyun.com/edge/pages/list)
- [CloudFlare Pages 入口](https://dash.cloudflare.com/workers-and-pages)

部署好在三个平台分别添加你的访问域名 如 [blog.yaooa.cn](https://blog.yaooa.cn)  
添加好后EdgeOne如图
![EdgeOne](./images/edgoonedoaminconfig.avif)
CloudFlare如图
![CloudFlare](./images/cloudflaredoaminconfig.avif)
阿里云ESA如图
![ESA](./images/esadoaminconfig.avif)
然后此时实际上你的站点已经接入三家CDN了，但是由于还没有添加DNS记录所以无法访问

## 设置地理分流
### 源站接入

以阿里云云解析DNS为例
CANME解析访问域名到中转域名，请求来源选择境外
再添加ESA,EdgeOne的CNAME，来源选择中国地区即可。
![AliDNS](./images/alidns.avif)
此时你的域名已经能正常访问并且应用了分流
### Pages 接入
以阿里云云解析DNS为例
解析访问域名到CloudFlare Pages提供的CNAME接入地址，请求来源选择境外
![AliDNS](./images/alidns.avif)
再添加ESA,EdgeOne的CNAME，来源选择中国地区即可。
此时你的域名已经能正常访问并且应用了分流

## 效果展示

![效果展示](./images/effect.avif)

## 注意

CloudFlare基本上不可能被打爆，但是ESA和EdgeOne在流量巨大时可能可能会被阿里和腾讯拒绝服务，请在ESA/EdgeOne设置拒绝海外访问和添加一些安全策略（因为刷子的ip基本都是海外，国内IP实名且价格昂贵基本上不容易被打）