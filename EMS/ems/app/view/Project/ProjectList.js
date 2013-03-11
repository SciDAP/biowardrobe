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


Ext.define('EMS.view.Project.ProjectList', {
               extend: 'Ext.Window',
               alias : 'widget.ProjectListWindow',
               width: 500,
               height: 350,
               minWidth: 400,
               minHeight: 250,
               title: 'List of projects',
               closable: true,
               maximizable: true,
               closeAction: 'hide',
               constrain: true,
               iconCls: 'default',

               layout: {
                   type: 'vbox',
                   align: 'stretch'

               },


               initComponent: function() {
                   var me=this;
                   me.prjStore=EMS.store.Project;

                   me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
                                                       store: me.prjStore,
                                                       displayInfo: true
                                                   });

                   me.dockedItems= [{
                                        xtype: 'toolbar',
                                        dock: 'bottom',
                                        ui: 'footer',
                                        layout: {
                                            pack: 'center'
                                        },
                                        items: [{
                                                minWidth: 90,
                                                text: 'Close',
                                                handler: function() { me.close(); }
                                            }]
                                    }];

                   this.items =  [
                            {
                                xtype: 'fieldset',
                                title: 'Project',
                                height: 70,
                                padding: 1,
                                margin: '0 5 0 5',
                                layout: {
                                    type: 'hbox'
                                },
                                items: [{
                                        xtype: 'textfield',
                                        id: 'project-name',
                                        fieldLabel: 'Project name',
                                        submitValue: false,
                                        margin: '0 5 0 5',
                                        labelAlign: 'top',
                                        flex: 1,
                                        labelWidth: 120
                                    } , {
                                        xtype: 'button',
                                        margin: '20 5 0 5',
                                        width: 90,
                                        text: 'add',
                                        id: 'project-add',
                                        submitValue: false,
                                        iconCls: 'folder-add',
                                    }]
                            } , {
                                xtype: 'grid',
                                border: true,
                                columnLines: true,
                                store: me.prjStore,
                                margin: '5 5 0 5',
                                multiSelect: false,
                                viewConfig: {
                                    enableTextSelection: false
                                },
                                columns: [
                                    { header: 'Project Name', dataIndex: 'name', flex:1, sortable: true}
                                ],
                                flex: 1,
                                bbar: [ me.m_PagingToolbar ]
                            }
                        ];
                   this.callParent(arguments);
               }

           });
