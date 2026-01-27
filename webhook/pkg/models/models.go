package models

import (
	"net/http"
	"net/url"
)

type Report struct {
	URI            string            `json:"uri"`
	Cookies        string            `json:"cookies"`
	Referrer       string            `json:"referrer"`
	UserAgent      string            `json:"user_agent"`
	Origin         string            `json:"origin"`
	Lang           string            `json:"lang"`
	GPU            string            `json:"gpu"`
	LocalStorage   map[string]string `json:"localstorage"`
	SessionStorage map[string]string `json:"sessionstorage"`
	DOM            string            `json:"dom"`
	Screenshot     string            `json:"screenshot"`
}

type Request struct {
	Address       string              `json:"address"`
	Port          string              `json:"port"`
	UserAgent     string              `json:"useragent"`
	Method        string              `json:"method"`
	Path          string              `json:"path"`
	Headers       map[string][]string `json:"headers"`
	Body          []byte              `json:"body"`
	Cookies       []*http.Cookie      `json:"cookies"`
	ContentLength int64               `json:"contentlength"`
	Protocol      string              `json:"protocol"`
	Form          url.Values          `json:"form"`
	PostForm      url.Values          `json:"postform"`
	Report        Report              `json:"report"`
	TimeStamp     string              `json:"timestamp"`
}

type StreamMessage struct {
	Key   string      `redis:"key"`
	Value interface{} `redis:"value"`
	Id    string      `redis:"id"`
}
