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

Ext.require('Ext.chart.*');
//Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit', 'Ext.window.MessageBox']);


Ext.define('EMS.view.charts.IslandsDistribution',
           {
               extend: 'Ext.chart.Chart',
               style: 'background:#fff',

               border: 0,

               animate: true,
               shadow: true,

               initComponent: function() {
                   var me=this;

                   me.legend={ position: 'right' };

                   Ext.applyIf(me, {
                       store: EMS.store.IslandsDistribution,
                       series: [{
                                    type: 'bar',
                                    axis: 'bottom',
                                    gutter: 80,
                                    xField: 'name',
                                    yField: ['Upstream', 'Promoter', 'Exon', 'Intron', 'Intergenic'],
                                    stacked: true,
                                    yPadding:{
                                        top: 200,
                                        bottom: 100
                                    },
                                    tips: {
                                        trackMouse: true,
                                        width: 140,
                                        height: 30,
                                        renderer: function (storeItem, item) {
                                            this.setTitle(String(item.value[1]));
                                        }
                                    },
                                    label: {
                                        display: 'insideEnd',
                                        field: ['Upstream', 'Promoter', 'Exon', 'Intron', 'Intergenic'],
                                        renderer: Ext.util.Format.numberRenderer('0'),
                                        //orientation: 'horizontal',
                                        color: '#333'
                                        //'text-anchor': 'middle'
                                    }
                                }],

                       axes: [{
                                  type: 'Numeric',
                                  position: 'bottom',
                                  fields: ['Upstream', 'Promoter', 'Exon', 'Intron', 'Intergenic'],
                                  title: 'Islands count'
                              } , {
                                  type: 'Category',
                                  position: 'left',
                                  fields: ['name']
                                  //title: 'Genome regions',
                              }]
                               });

                   me.callParent(arguments);
               }
           });