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
Ext.require([
    'Ext.grid.*', 'Ext.data.*', 'Ext.dd.*', 'Ext.ux.form.SearchField'
]);

Ext.define('EMS.view.Project2.DESeq', {
    extend: 'Ext.panel.Panel',
    id: 'Project2DESeq',
    layout: 'border',
    region: 'center',
    iconCls: 'index2',
    border: false,


    initComponent: function () {
        var me = this;

        me.title= me.atypeid==1?'DESeq analysis':'DESeq2 analysis';

        me.addEvents('Back', 'groupadd', 'filter');

        me.m_PagingToolbar = Ext.create('Ext.PagingToolbar', {
            store: me.labDataStore,
            displayInfo: true,
            flex: 1,
            margin: 0,
            padding: 0
        });
        var rawData = {
            xtype: 'panel',
            region: 'west',
            title: 'RNA-Seq data',
            collapsible: true,
            collapsed: true,
            border: false,
            minWidth: 100,
            split: true,
            margin: 0,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1,
            items: [
                {
                    xtype: 'container',
                    padding: 0,
                    margin: 5,
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'egroups',
                            tpl: '<tpl for="."><div class="x-boundlist-item" ><b>{name}</b><div style="display: block; text-align: justify; line-height:100%; font-size:80%; color: #449;"> {description}</div></div></tpl>',
                            margin: '0 5 0 5',
                            //labelWidth: 110,
                            minWidth: 200,
                            displayField: 'name',
                            //fieldLabel: 'Select by projects',
                            valueField: 'id',
                            //store: 'EGroups',
                            store: Ext.create('EMS.store.EGroups', {storeId: Ext.id()}).
                                    load({params: {
                                             addall: true }
                                         }),
                            queryMode: 'local',
                            //forceSelection: true,
                            editable: false
                            /*
                            xtype: 'combobox',
                            id: 'project-worker-changed',
                            displayField: 'fullname',
                            editable: false,
                            valueField: 'id',
                            margin: '0 5 0 0',
                            flex: 1,
                            labelAlign: 'top',
                            labelWidth: 120,
                            store: EMS.store.Worker,
                            value: USER_ID
                            */
                        } ,
                        {
                            xtype: 'searchfield',
                            submitValue: false,
                            emptyText: 'Search string',
                            flex: 1,
                            store: me.labDataStore
                        }
                    ]
                } ,
                {
                    xtype: 'grid',
                    border: false,
                    columnLines: true,
                    store: me.labDataStore,
                    multiSelect: true,
                    hideHeaders: true,
                    viewConfig: {
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            dragGroup: 'ldata2results'
                        },
                        copy: true,
                        enableTextSelection: false
                    },
                    columns: [
                        { header: '', dataIndex: 'combined', flex: 1, sortable: false }
                    ],
                    flex: 3,
                    bbar: [ me.m_PagingToolbar ]
                }
            ]
        };

        var geneList = {
            xtype: 'panel',
            title: 'Genes Lists',
            frame: false,
            border: false,
            region: 'center',
            split: true,
            minWidth: 100,
            //id
            collapsible: false,
            collapsed: false,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    padding: 0,
                    margin: 5,
                    layout: {
                        type: 'hbox'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            submitValue: false,
                            emptyText: 'Type group name then press enter to add',
                            flex: 2,
                            enableKeyEvents: true,
                            listeners: {
                                specialkey: function (field, event) {
                                    if (event.getKey() === event.ENTER) {
                                        me.fireEvent('groupadd', arguments);
                                    }
                                }
                            }
                        }
                    ]
                } ,
                {
                    xtype: 'treepanel',
                    id: 'projectgenelisttree',
                    store: me.resultStore,
                    rootVisible: false,
                    hideHeaders: true,
                    border: false,
                    columnLines: true,
                    flex: 3,
                    selType: 'cellmodel',
                    viewConfig: {
                        toggleOnDblClick: false,
                        plugins: {
                            ptype: 'treeviewdragdrop',
                            appendOnly: true,
                            sortOnDrop: true,
                            ddGroup: 'ldata2results'
                        }
                    },
                    plugins: [
                        Ext.create('Ext.grid.plugin.CellEditing', {
                            clicksToEdit: 2
                        })
                    ],
                    columns: [
                        {
                            xtype: 'treecolumn',
                            flex: 1,
                            minWidth: 150,
                            dataIndex: 'name',
                            editor: {
                                xtype: 'textfield',
                                allowBlank: false
                            }
                        } ,
                        {
                            xtype: 'actioncolumn',
                            width: 80,
                            align: 'right',
                            sortable: false,
                            items: [
                                {
                                    handler: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
                                        if (record.data.parentId === 'de') {
                                            me.fireEvent('filter', grid, rowIndex, colIndex, actionItem, event, record, row);
                                        }
                                        if (record.data.parentId === 'gd') {
                                            me.fireEvent('deseq', grid, rowIndex, colIndex, actionItem, event, record, row, me.atypeid);
                                        }
                                    },
                                    getClass: function (v, meta, rec) {
                                        if (rec.data.root === true || rec.data.parentId === 'root')
                                            meta.css = 'x-hide-display';
                                        //                                        this.items[0].handler = function (grid, rowIndex, colIndex, actionItem, event, record, row) {
                                        //                                            if (record.data.parentId === 'de') {
                                        //                                                me.fireEvent('filter', grid, rowIndex, colIndex, actionItem, event, record, row);
                                        //                                            }
                                        //                                            if (record.data.parentId === 'gd') {
                                        //                                                me.fireEvent('deseq', grid, rowIndex, colIndex, actionItem, event, record, row);
                                        //                                            }
                                        //                                        };
                                        if (rec.data.parentId === 'de') {
                                            return 'funnel-add';
                                        }
                                        if (rec.data.parentId === 'gd') {
                                            return 'index-add';
                                        }
                                    }
                                } ,
                                /*{
                                    getClass: function (v, meta, rec) {
                                        return 'space5';
                                    }
                                } ,*/
                                {
                                    getClass: function (v, meta, rec) {
                                        if (rec.data.root === true || rec.data.parentId === 'root')
                                            return;
                                        this.items[1].text = 'download';
                                        this.items[1].tooltip = 'download';
                                        this.items[1].handler = function (grid, rowIndex, colIndex, actionItem, event, record, row) {
                                            window.location = "data/csvgl.php?id=" + record.data['id'] + "&grp=" + !record.data['leaf'];
                                        };
                                        return 'disk';

                                    }/*,
                                 isDisabled: function(view,rowIndex,colIndex,item,record) {
                                 if(record.data.atype_id===1)
                                 return false;
                                 return true;
                                 }*/
                                } ,
//                                {
//                                    getClass: function (v, meta, rec) {
//                                        return 'space';
//                                    }
//                                } ,
                                {
                                    getClass: function (v, meta, rec) {
                                        if (rec.data.root === true || rec.data.parentId === 'root')
                                            return;
                                        this.items[2].tooltip = 'Delete';
                                        this.items[2].handler = function (grid, rowIndex, colIndex, actionItem, event, record, row) {
                                            Ext.Msg.show({
                                                title: 'Deleteing record ' + record.data.name,
                                                msg: 'Are you sure, that you want to delete the record "' + record.data.name + '"  all data that belongs to it will be deleted. This process is nonreversible ' + 'and will delete all other records that have used this one.',
                                                icon: Ext.Msg.QUESTION,
                                                buttons: Ext.Msg.YESNO,
                                                fn: function (btn) {
                                                    if (btn !== "yes") return;
                                                    record.remove(true);
                                                }
                                            });
                                        }
                                        if (rec.data.leaf === false)
                                            return 'folder-delete'; else
                                            return 'table-row-delete';
                                    }
                                }
                            ]
                        }
                    ]
                } ,
                {
                    xtype: 'splitter'
                } ,
                {
                    xtype: 'panel',
                    id: 'genelist-details-panel',
                    title: 'Details',
                    collapsible: true,
                    collapsed: true,
                    border: false,
                    minWidth: 50,
                    minHeight: 50,
                    margin: 0,
                    layout: {
                        type: 'fit'
                    },
                    flex: 1,
                    bodyStyle: 'padding-bottom:15px;background:#eee;',
                    autoScroll: true,
                    html: '<p class="details-info">Select a row in &quot;Gene List&quot; folder, detailed information will appear.</p>'
                }
            ]
        };
        /////////////////////////////
        me.items = [rawData, geneList];
        me.tools = [
            {
                xtype: 'tbfill'
            } ,
            {
                xtype: 'button',
                text: 'Back',
                handler: function () {
                    me.fireEvent('Back');
                }
            }
        ];

        me.callParent(arguments);
    }
});
