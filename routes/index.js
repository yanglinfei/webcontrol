var express = require('express');
var file = require('fs');
var http = require('http')

var router = express.Router();

var SERVER_ADDRESS = '192.168.0.100'

function addFlow(ip) {
    var data =  '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'+
                '<input xmlns="urn:opendaylight:flow:service">\n'+
                    '<barrier>false</barrier>\n'+
                    '<node xmlns:inv="urn:opendaylight:inventory">/inv:nodes/inv:node[inv:id="openflow:1"]</node>\n'+
                    '<cookie>500</cookie>\n' +
                    '<hard-timeout>0</hard-timeout>\n' +
                    '<idle-timeout>0</idle-timeout>\n' +
                    '<installHw>false</installHw>\n' +
                    '<match>\n' +
                        '<ethernet-match>\n' +
                            '<ethernet-type>\n'+
                                '<type>2048</type>\n'+
                            '</ethernet-type>\n'+
                        '</ethernet-match>\n'+
                        '<ipv4-source>'+ip+'/32</ipv4-source>\n'+
                        '<ipv4-destination>10.0.0.5/32</ipv4-destination>\n'+
                    '</match>\n'+
                    '<instructions>\n'+
                        '<instruction>\n'+
                            '<order>0</order>\n'+
                            '<apply-actions>\n'+
                                '<action>\n'+
                                    '<order>0</order>\n'+
                                    '<drop-action/>\n'+
                                '</action>\n'+
                            '</apply-actions>\n'+
                        '</instruction>\n'+
                    '</instructions>\n'+
                    '<priority>1000</priority>\n'+
                    '<strict>false</strict>\n'+
                    '<table_id>0</table_id>\n'+
                '</input>\n';

    var options = {
        hostname: SERVER_ADDRESS,
        port: 8181,
        path: '/restconf/operations/sal-flow:add-flow',
        method: 'POST',
        auth: 'admin:admin',
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': data.length
        }
    };
    var req = http.request(options,function (res) {
        if(res.statusCode == 200){
            console.log("OK");
        }
        else{
            console.log("FAIL");
        }
    });
    req.write(data);
    req.end();

}
function delFlow(ip) {
    var data =  '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'+
                '<input xmlns="urn:opendaylight:flow:service">\n'+
                '<barrier>false</barrier>\n'+
                '<node xmlns:inv="urn:opendaylight:inventory">/inv:nodes/inv:node[inv:id="openflow:1"]</node>\n'+
                '<cookie>500</cookie>\n' +
                '<hard-timeout>0</hard-timeout>\n' +
                '<idle-timeout>0</idle-timeout>\n' +
                '<installHw>false</installHw>\n' +
                '<match>\n' +
                    '<ethernet-match>\n' +
                        '<ethernet-type>\n'+
                            '<type>2048</type>\n'+
                        '</ethernet-type>\n'+
                    '</ethernet-match>\n'+
                    '<ipv4-source>'+ip+'/32</ipv4-source>\n'+
                    '<ipv4-destination>10.0.0.5/32</ipv4-destination>\n'+
                '</match>\n'+
                '<priority>1000</priority>\n'+
                '<strict>false</strict>\n'+
                '<table_id>0</table_id>\n'+
                '</input>\n';

    var options = {
        hostname: SERVER_ADDRESS,
        port: 8181,
        path: '/restconf/operations/sal-flow:remove-flow',
        method: 'POST',
        auth: 'admin:admin',
        headers: {
            'Content-Type': 'application/xml',
            'Content-Length': data.length
        }
    };
    var req = http.request(options,function (res) {
        if(res.statusCode == 200){
            console.log("OK");
        }
        else{
            console.log("FAIL");
        }
    });
    req.write(data);
    req.end();
}

function updateFlow(){
    file.readFile('database/backlist.json','utf-8', function (err, data) {
        if(err) {
            console.log(err);
        }
        else {
            var ips = eval(data);
            for(var i in ips) {
                addFlow(ips[i]);
            }
        }
    })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/backlist',function (req, res, next) {
  file.readFile('database/backlist.json','utf-8', function (err, data) {
    if(err) {
      console.log(err);
    }
    else {
      console.log(data);
    }
      res.send(data);
  })
});

router.post('/backlist',function (req,res,next) {
    updateFlow();

    file.readFile('database/backlist.json','utf-8', function (err, data) {
        if(err) {
            console.log(err);
        }
        else {
            console.log(eval(req.body));
            var ips = eval(data);
            ips.push(eval(req.body)['ip']);
            file.writeFile('database/backlist.json',JSON.stringify(ips));
            res.send(JSON.stringify(ips));
            addFlow(eval(req.body)['ip']);
        }
    })
})
router.post('/remove',function (req,res,next) {
    file.readFile('database/backlist.json','utf-8', function (err, data) {
        if(err) {
            console.log(err);
        }
        else {
            console.log(eval(req.body)['ip']);
            var ips = eval(data);
            var tmp = []
            for (var ip in ips){
                if(ip != eval(req.body)['ip']){
                    tmp.push(ips[ip])
                }
                else {
                    delFlow(ips[ip]);
                }
            }
            file.writeFile('database/backlist.json',JSON.stringify(tmp));
            console.log(JSON.stringify(tmp))
            res.send(JSON.stringify(tmp));
        }
    })
})

updateFlow();

module.exports = router;
