/****************************************************************************
**
** Copyright (C) 2011-2014 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the averagedensity module of the genome-tools.
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

#include "atdp.hpp"

class ATDPThreads: public QRunnable
{

    public:

        EXPERIMENT_INFO* exp_i;
        ATDPBasics* atdpb;

        ATDPThreads(EXPERIMENT_INFO* e):
            exp_i(e) {
            atdpb = new ATDPBasics(exp_i);
            this->setAutoDelete(true);
        };

        void run(void){
            atdpb->RegionsProcessing();
        }

};

//-------------------------------------------------------------
//-------------------------------------------------------------
ATDP::ATDP(QObject* parent):
    QObject(parent)
{
    avd_window=gArgs().getArgs("avd_window").toInt();
    avd_whole_region=avd_window*2+1;
    avd_heat_window=gArgs().getArgs("avd_heat_window").toInt();
    twicechr=gArgs().getArgs("sam_twicechr").toString();
    ignorechr=gArgs().getArgs("sam_ignorechr").toString();

}

void ATDP::start() {

    EXPERIMENT_INFO* exp_i;

    qDebug()<<"start";

    /*
     * Prepare experiments to proccess
     */
    if(!gArgs().getArgs("avd_luid").toString().isEmpty()) {
        this->getRecordInfo();
    } else if(!gArgs().getArgs("avd_guid").toString().isEmpty()) {
        this->getRecordsInfo();
    } else {
        throw "Starving for uid";
    }


    QThreadPool *t_pool=QThreadPool::globalInstance();

    foreach(QString key,experiment_info.keys()){
        t_pool->start(new ATDPThreads(&experiment_info[key]));
    }//foreach trough experiments

    if(t_pool->activeThreadCount()!=0) {
        qDebug()<<"waiting threads";
        t_pool->waitForDone();
    }

    foreach(QString key,experiment_info.keys()){
        exp_i=&experiment_info[key];
        QVector<double> storage=Math::smooth<double>(exp_i->avd_total,gArgs().getArgs("avd_smooth").toInt());
        /*
         *  AVD
         */
        QFile outFile;
        outFile.setFileName(key+".csv");
        outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        QString out;
        for(int j=0; j<storage.size();j++) {
            out+=QString("%1,%2\n").arg(j).arg(storage.at(j));
        }
        outFile.write(out.toLocal8Bit());
        outFile.close();
        out.clear();
        /*
         *  AVD HEAT
         */
        outFile.setFileName(key+".matrix");
        outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
        QList<QPair<quint64,quint64> > sort;
        bool do_sort=gArgs().getArgs("avd_sort").toBool();
        for(int j=0; j<exp_i->avd_matrix.size();j++) {
            quint64 sum_line=0;
            for(int c=0; c<exp_i->avd_matrix[j].second.size();c++) {
                sum_line+=exp_i->avd_matrix[j].second[c];
                if(!do_sort) {
                    out+=QString("%1 ").arg(exp_i->avd_matrix[j].second[c]);
                }
            }
            if(do_sort) {
                sort.append(qMakePair(sum_line,j));
            } else {
                out.chop(1);
                out+=QString("\n");
            }
        }
        if(do_sort){
            qSort(sort.begin(), sort.end());
            for(int j=0; j<exp_i->avd_matrix.size();j++) {
                for(int c=0; c<exp_i->avd_matrix[j].second.size();c++) {
                        out+=QString("%1 ").arg(exp_i->avd_matrix[sort[j].second].second[c]);
                }
                out.chop(1);
                out+=QString("\n");
            }
        }//do sort

        outFile.write(out.toLocal8Bit());
        outFile.close();
        out.clear();

    }//foreach trough experiments


    qDebug()<<"end";

    /*

    QSqlQuery q;
    q.prepare("describe `"+gSettings().getValue("experimentsdb")+"`.`"+gArgs().getArgs("uid").toString()+"_islands`");
    if(!q.exec()) {
        qDebug()<<"Cant describe "<<q.lastError().text();
        throw "Error describe";
    }
    q.next();
*/

    emit finished();
}


void ATDP::getRecordInfo() {
    QSqlQuery q;
    q.prepare("select g.db,g.annottable,l.fragmentsize,l.tagsmapped,l.filename from labdata l,genome g where l.uid=? and g.id=l.genome_id");
    q.bindValue(0, gArgs().getArgs("avd_luid").toString());
    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        throw "Error query to DB";
    }
    q.next();
    EXPERIMENT_INFO *ei = new EXPERIMENT_INFO();
    ei->source=q.value(1).toString();
    ei->db=q.value(0).toString();
    ei->fragmentsize=q.value(2).toInt();
    ei->mapped=q.value(3).toInt();
    ei->filepath=q.value(4).toString()+".bam";
    ei->avd_total.resize(avd_whole_region);
    ei->avd_total.fill(0,avd_whole_region);
    experiment_info.insert(gArgs().getArgs("avd_luid").toString(),*ei);
}

void ATDP::getRecordsInfo() {
    QSqlQuery q;

     q.prepare("select a.pltname,tbl1_id,tbl2_id,l.fragmentsize,l.tagsmapped,g2.tableName,g.tableName "
        " from atdp a,genelist g, genelist g2, labdata l where a.genelist_id=? "
        " and g.labdata_id=l.id and a.tbl1_id=g.id and a.tbl2_id=g2.id");
    q.bindValue(0, gArgs().getArgs("avd_guid").toString());
    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        throw "Error query to DB";
    }
    while(q.next()) {
        EXPERIMENT_INFO *ei = new EXPERIMENT_INFO();
        ei->source=q.value(5).toString();
        ei->db=gSettings().getValue("experimentsdb");
        ei->fragmentsize=q.value(3).toInt();
        ei->mapped=q.value(4).toInt();
        ei->filepath=q.value(6).toString()+".bam";
        ei->avd_total.resize(avd_whole_region);
        ei->avd_total.fill(0,avd_whole_region);
        experiment_info.insert(q.value(0).toString()+"_"+q.value(1).toString()+"_"+q.value(2).toString(),*ei);
    }
}


ATDP::~ATDP()
{
}


//        QSvgGenerator generator;
//        generator.setFileName(gArgs().fileInfo("out").baseName()+".svg");
//        generator.setSize(QSize(200, 200));
//        generator.setViewBox(QRect(0, 0, 200, 200));
//        generator.setTitle(tr("SVG Generator Example Drawing"));
//        generator.setDescription(tr("An SVG drawing created by the SVG Generator "
//            "Example provided with Qt."));
//        QPainter painter;
//        painter.begin(&generator);
//        painter.fillRect(QRect(0, 0, 200, 200), Qt::gray);
//        painter.setPen(QPen(Qt::white, 4, Qt::DashLine));
//        painter.drawLine(QLine(0, 35, 200, 35));
//        painter.drawLine(QLine(0, 165, 200, 165));
//        painter.end();
//return;



#if 0

void ATDHeatmap::batchsql() {
    int avd_lid=gArgs().getArgs("avd_lid").toInt();
    QString avd_id=gArgs().getArgs("avd_id").toString();
    int avd_window=gArgs().getArgs("avd_window").toInt();
    QString sort_name=gArgs().getArgs("avd_sort_name").toString();
    QString special_sort_name=gArgs().getArgs("avd_sort_column").toString();
    QFile outFile;
    QString columns="";
    QString orderby="";
    QStringList columns_names;

    if(!gArgs().getArgs("avd_expresssion_columns").toString().isEmpty()) {
        columns=gArgs().getArgs("avd_expresssion_columns").toString();
        columns_names=columns.split(',');
        columns=","+columns;
    }

    if(!special_sort_name.isEmpty()) {
        orderby=" order by "+special_sort_name;
        special_sort_name=","+special_sort_name;
    } else if(columns_names.count()>0 && columns_names.contains(sort_name)) {
        orderby=" order by "+sort_name;
    }

    if(avd_lid>0 && avd_id.length()>0) {
        qDebug()<<"Either _pid or _lid can be greater then 0.";
        return;
    }

    QThreadPool *t_pool=QThreadPool::globalInstance();

    /*
     * Average Tag Density by genelist ID (future result id)
     *
     */

    if(avd_id.length()>0) {
        QMap<QString,DNA_SEQ_DATA> table_to_data;
        QString BASE_DIR="/data/DATA/FASTQ-DATA";

        q.prepare("select distinct e.etype,l.name4browser,g.db,filename,l.fragmentsize,UPPER(w.worker) as worker,a.tbl1_id "
                  "from ems.labdata l,ems.experimenttype e,ems.genome g, ems.worker w , ems.atdp a,ems.genelist ge "
                  "where e.id=experimenttype_id and g.id=l.genome_id and l.worker_id=w.id and "
                  "l.id=ge.labdata_id and a.tbl1_id=ge.id and a.genelist_id like ?;");
        q.bindValue(0, avd_id);

        if(!q.exec()) {
            qDebug()<<"Query error info: "<<q.lastError().text();
            return;
        }

        int fieldFilename = q.record().indexOf("filename");
        int fieldEtype = q.record().indexOf("etype");
        int fieldWorker = q.record().indexOf("worker");
        int fieldFsize = q.record().indexOf("fragmentsize");
        int fieldTbl = q.record().indexOf("tbl1_id");


        while(q.next()) {
            QString filename=q.value(fieldFilename).toString();
            if(filename.contains(';'))
                filename=filename.split(';').at(0);
            QString EType =q.value(fieldEtype).toString();
            QString worker=q.value(fieldWorker).toString();
            int fragmentsize =q.value(fieldFsize).toInt();
            QString TBL = q.value(fieldTbl).toString();
            bool pair=(EType.indexOf("pair")!=-1);

            QString path=BASE_DIR+"/"+worker+"/"+EType.left(3)+"/";

            DNA_SEQ_DATA dsd;
            dsd.fragmentsize=fragmentsize;
            dsd.pair=pair;
            dsd.sam_data=new gen_lines();
            table_to_data[TBL]=dsd;
            t_queue.append(new sam_reader_thread(table_to_data[TBL].sam_data,path+filename+".bam"));
            t_pool->start(t_queue.last());
        }

        if(table_to_data.size()==0) {
            qDebug()<<"No records";
            return;
        }


        if(t_pool->activeThreadCount()!=0) {
            qDebug()<<"waiting threads";
            t_pool->waitForDone();
        }

        QString avd_window_str=QString("%1").arg(avd_window);

        // differencese start here


        //QList<QList<double> > storages;

        QSqlQuery qq;
        qq.prepare("select tbl1_id,tableName,pltname,gl.type from ems.atdp a, ems.genelist gl where a.tbl2_id=gl.id and a.genelist_id like ? order by a.tbl1_id,a.tbl2_id;");
        qq.bindValue(0, avd_id);
        if(!qq.exec()) {
            qDebug()<<"Query error info: "<<q.lastError().text();
            return;
        }
        int nplot=0;
        QMap<QString,QMap<int,QVector<double> > > storage_heatmap;

        while(qq.next()) {//loop trough all plots and corresponding gene lists
            QString cur_tbl = qq.value(0).toString();
            QString plt_name = qq.value(2).toString();
            QString sel_table = "experiments.`"+qq.value(1).toString()+"`";
            QString sql_queryp,sql_querym,sql_query;

            if(qq.value(3).toInt()<100) {
                sql_queryp="select chrom,strand,txStart-"+avd_window_str+" as start,txStart+"+avd_window_str+" as end "+columns+special_sort_name+" from "
                           +sel_table+" where strand = '+' ";
                sql_querym="select chrom,strand,txEnd-"+avd_window_str+" as start,txEnd+"+avd_window_str+" as end "+columns+special_sort_name+"  from "
                           +sel_table+" where strand = '-' ";
                sql_query=sql_queryp+" union "+sql_querym+" "+orderby;
            } else if(qq.value(3).toInt()==101){
                sql_query="select chrom,'+' as strand,(start+end)/2-"+avd_window_str+" as start,(start+end)/2+"+avd_window_str+" as end from "
                          +sel_table+"_macs ";
            }

            if(!q.exec(sql_query)) {//takes gene lists coordinates into q
                qDebug()<<"Query error "<<sel_table<<": "<<q.lastError().text();
                qDebug()<<"SQL "<<sql_query;
                return;
            }

            int fieldChrom = q.record().indexOf("chrom");
            int fieldStrand = q.record().indexOf("strand");
            int fieldStart= q.record().indexOf("start");
            int fieldEnd= q.record().indexOf("end");
            int length=avd_window*2+1;
            int WIN_SIZE=200;
            int heatmap_length=length/WIN_SIZE;
            //int records = q.size();

            int gcount=0;
            if(!columns.isEmpty() && nplot==0) {
                outFile.setFileName(gArgs().fileInfo("out").path()+"/"+"EXPRESSION"+".raw_data");
                outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);
                //                QString line="";
                //                for(int j=0; j<columns_names.size();j++) {
                //                    line.append(QString("%1 ").arg(columns_names.at(j)));
                //                }
                //                line.chop(1);
                //                line+="\n";
                //                outFile.write(line.toAscii());
            }
            while(q.next()) { //loop trough all genes for the current plot
                QVector<double> avd_raw_data(length+1,0);
                if(!columns.isEmpty() && nplot==0) {
                    QString line="";
                    for(int j=0; j<columns_names.size();j++) {
                        line.append(QString("%1 ").arg(q.value(q.record().indexOf(columns_names.at(j))).toFloat()));
                    }
                    line.chop(1);
                    line+="\n";
                    outFile.write(line.toLocal8Bit());
                }
                bool strand=(q.value(fieldStrand).toString().at(0)==QChar('-'));
                int Start=q.value(fieldStart).toInt();
                int End=q.value(fieldEnd).toInt();
                QString Chrom=q.value(fieldChrom).toString();

                if(gArgs().getArgs("sam_ignorechr").toString().contains(Chrom)) {
                    continue;
                }
                AVDS<QVector<double> >(Start/*start*/,End/*end*/,Chrom/*chrom*/,
                                       strand/*bool strand*/,table_to_data[cur_tbl].fragmentsize/2/*shift*/,
                                       table_to_data[cur_tbl].sam_data,avd_raw_data,table_to_data[cur_tbl].pair);

                storage_heatmap[plt_name][gcount].fill(0.0,heatmap_length);
                int sum=0;
                for(int j=0; j< length;j++) {
                    sum+=avd_raw_data[j];

                    if((j%WIN_SIZE)==0 && j>0) {
                        storage_heatmap[plt_name][gcount][j/WIN_SIZE -1]=sum;
                        sum=0;
                    }
                }
                if((length)%WIN_SIZE > WIN_SIZE/2 )
                    storage_heatmap[plt_name][gcount].append(sum);
                gcount++;
            }
            if(!columns.isEmpty() && nplot==0) {
                outFile.close();
            }
            nplot++;
        }//qq.next


        QList<QString> keys=storage_heatmap.keys();
        int files=keys.size();

        QList<QPair<int,int> > sort;
        bool do_sort=!sort_name.isEmpty() && orderby.isEmpty();

        for(int i=0; do_sort && i<files-1;i++) {
            if(storage_heatmap[keys[i]].size() != storage_heatmap[keys[i+1]].size()) {
                do_sort=false;
            }
        }
        if(do_sort && !keys.contains(sort_name)) {
            do_sort=false;
        } else {
            for(int j=0; j<storage_heatmap[sort_name].size();j++) {
                int sum_line=0;
                for(int r=0;r<storage_heatmap[sort_name][j].size();r++) {
                    sum_line+=storage_heatmap[sort_name][j].at(r);
                }
                sort.append(qMakePair(sum_line,j));
            }
            qSort(sort.begin(), sort.end());
        }


        for(int i=0; i<files;i++) {
            QString filename=keys[i];

            outFile.setFileName(gArgs().fileInfo("out").path()+"/"+filename.replace(" ","_")+".raw_data");
            outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

            for(int j=0; j<storage_heatmap[keys[i]].size();j++) {
                QString line="";
                for(int r=0;r<storage_heatmap[keys[i]][j].size();r++) {
                    if(do_sort) {
                        line.append(QString("%1 ").arg(storage_heatmap[keys[i]][sort.at(j).second].at(r)));
                    } else {
                        line.append(QString("%1 ").arg(storage_heatmap[keys[i]][j].at(r)));
                    }
                }
                line.chop(1);
                line+="\n";
                outFile.write(line.toLocal8Bit());
            }
            outFile.close();
        }


        /*
         QString Y="`Y0` FLOAT NULL ,";
        for(int i=1; i<nplot;i++) {
            Y+=QString("`Y%1` FLOAT NULL ,").arg(i);
        }

        QString CREATE_TABLE=QString("DROP TABLE IF EXISTS experiments.%1;"
                                     "CREATE TABLE experiments.%2( "
                                     "`X` INT NULL ,"+Y+
                                     "INDEX X_idx (X) using btree"
                                     ")"
                                     "ENGINE = MyISAM "
                                     "COMMENT = 'created by averagedensity';").
                             arg(avd_table_name).
                             arg(avd_table_name);

        if(!q.exec(CREATE_TABLE)) {
            qDebug()<<"Query error T: "<<q.lastError().text();
        }

        QString SQL_QUERY_BASE=QString("insert into experiments.%1 values ").
                               arg(avd_table_name);
        QString SQL_QUERY="";

        int rows=storages[0].size();
        for(int i=0; i<rows;i++) {
            SQL_QUERY+=QString(" (%1").arg((int)(i-rows/2));
            for(int c=0;c<nplot;c++) {
                if(isnan(storages[c].at(i)) || isinf(storages[c].at(i))) {
                    SQL_QUERY+=QString(",%1").arg(0);
                } else {
                    SQL_QUERY+=QString(",%1").arg(storages[c].at(i));
                }
            }
            SQL_QUERY+=QString("),");
        }

        SQL_QUERY.chop(1);
        if(!q.exec(SQL_QUERY_BASE+SQL_QUERY+";")) {
            qDebug()<<"Query error batch up: "<<q.lastError().text();
            qDebug()<<"Query error batch up: "<<SQL_QUERY_BASE;
        }
        */
    }//aid>0
}
#endif
