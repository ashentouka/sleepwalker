const ip_port_regex = /(?:(\w+)(?::(\w*))@)?([a-zA-Z0-9][a-zA-Z0-9-_]{0,61}[a-zA-Z0-9]{0,1}\.([a-zA-Z]{1,6}|[a-zA-Z0-9-]{1,30}\.[a-zA-Z]{2,3})|((?:\d{1,3})(?:\.\d{1,3}){3}))(?::(\d{1,5}))$/
const ipport = "78.36.198.158:80";
const userpass = "yqWs4t4nVDd4J78g9XgzuFDj:oPJRhmvhgzxCxm1jzGbchnut@ad1.nordvpn.com:89";

console.log(ip_port_regex.test(ipport));
console.log(ip_port_regex.test(userpass));