/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the EMS web interface module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/
Ext.define( 'EMS.store.Antibodies', {
               extend: 'Ext.data.Store',

               requires: ['EMS.model.Antibodies'],
               storeId: 'Antibodies',
               model:  'EMS.model.Antibodies',
               autoLoad: false,
               singleton: true,
               proxy:{
                   type: 'ajax',
                   api: {
                       read : '/cgi-bin/barski/records.json',
                       update: '/cgi-bin/barski/recordsUp.json',
                       create: '/cgi-bin/barski/recordsNew.json',
                       destroy: '/cgi-bin/barski/recordsDel.json'
                   },
                   extraParams: {
                       //                               username: Ext.util.JSON.decode(window.localStorage.getItem('settings')).username,
                       //                               password: Ext.util.JSON.decode(window.localStorage.getItem('settings')).password
                       tablename:  'Antibodies'
                   },
                   //                   actionMethods: {
                   //                           create: 'GET',
                   //                           read: 'GET',
                   //                           update: 'GET',
                   //                           destroy: 'GET'
                   //                       },
                   reader: {
                       type: 'json',
                       root: 'data',
                       successProperty: 'success'
                   },
                   writer: {
                       type: 'json',
                       root: 'data',
                       writeAllFields: true,
                       encode: true
                   },
//                   afterRequest: function(request, success) {
//                       if(request.action==='create' && typeof request.operation.response !== 'undefined')
//                       {
//                           console.log("", request.operation.response);
//                           var string= request.operation.response.responseText;
//                           var decodedString = Ext.decode(string);
//                           console.log(decodedString);
//                           Ext.Msg.alert('Success');
//                       }
//                       if(request.action==='create' && typeof request.operation.response === 'undefined')
//                       {
//                           Ext.Msg.alert('Failure');
//                       }
//                   },
                   listeners: {
                       exception: function(proxy, response, operation) {

                           // response contains responseText, which has the message
                           // but in unparsed Json (see below)
                           console.log(proxy, response, operation);
                           try{
                               var json = Ext.decode(response.responseText);
                               if (json) {
                                   //detl.getForm().markInvalid(json.errors);
                                   Ext.MessageBox.show({
                                                           title: 'Save Failed',
                                                           msg: json.message,
                                                           icon: Ext.MessageBox.ERROR,
                                                           buttons: Ext.Msg.OK
                                                       });
                                   console.log('Save failed:',json.message,' error:',json.errors);
                               } else
                               {
                                   Ext.MessageBox.show({
                                                           title: 'Save Failed',
                                                           msg: operation.getError(),
                                                           icon: Ext.MessageBox.ERROR,
                                                           buttons: Ext.Msg.OK
                                                       });
                               }
                           }
                           catch(Error)
                           {
                               Ext.Msg.show({
                                                       title: 'Save Failed',
                                                       msg: 'Error in "'+operation.action+'" operation',
                                                       icon: Ext.Msg.ERROR,
                                                       buttons: Ext.Msg.OK
                                                   });
                           }
                       }}
               }
           });
