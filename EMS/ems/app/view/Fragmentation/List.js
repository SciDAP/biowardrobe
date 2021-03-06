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


Ext.define('EMS.view.Fragmentation.List' ,{
               extend: 'Ext.grid.Panel',

               initComponent: function() {

                   var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
                                                    clicksToEdit: 1
                                                });

                   Ext.apply(this, {
                                 store: EMS.store.Fragmentation,
                                 columns: [
                                     Ext.create('Ext.grid.RowNumberer'),
                                     {header: 'Fragmentation', dataIndex: 'fragmentation', flex: 1, editor: { allowBlank: false} },
                                     {
                                         xtype: 'actioncolumn',
                                         width:35,
                                         sortable: false,
                                         items: [{
                                                 iconCls: 'table-row-delete',
                                                 tooltip: 'Delete Experiment Type',
                                                 handler: function(grid, rowIndex, colIndex) {
                                                     EMS.store.Fragmentation.removeAt(rowIndex);
                                                 }
                                         }]
                                     }
                                 ],
                                 plugins: [cellEditing],
                                 tbar: [
                                     {
                                         text:'New',
                                         tooltip:'Add a new fragmentation type',
                                         handler : function(){
                                             var r = Ext.create('EMS.model.Fragmentation', {
                                                                    fragmentation: 'New Fragmentation Type'
                                                                });
                                             EMS.store.Fragmentation.insert(0, r);
                                             cellEditing.startEditByPosition({row: 0, column: 1});
                                         },
                                         iconCls:'table-row-add'
                                     },
                                     {
                                         text:'Save',
                                         tooltip:'Save changes',
                                         handler : function(){
                                             EMS.store.Fragmentation.sync({
                                                                              success: function (batch, options) {
                                                                                  console.log('Sync successed' ,batch, options);
                                                                                  EMS.store.Fragmentation.load();
                                                                              }});
                                         },
                                         iconCls:'table-ok'
                                     } , {
                                         text:'Reload',
                                         tooltip:'Reload',
                                         handler : function(){
                                             EMS.store.Fragmentation.load();
                                         },
                                         iconCls:'table-refresh'
                                     }
                                 ]//tbar

                             });
                   this.callParent(arguments);
               }
           });
