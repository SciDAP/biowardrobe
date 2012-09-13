Expressed
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0>2
Silent
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<1
Inducible at 40
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_40 >2 and EM_FPKM_40/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>2
Inducible at 150
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_150 >2 and EM_FPKM_150/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>2
Higly Inducible at 40
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_40 >2 and EM_FPKM_40/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>10
Higly Inducible at 150
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_150 >2 and EM_FPKM_150/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>10
Inducible at 40 in Naive not EM				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where Naive_FPKM_0<2 and Naive_FPKM_40 >2 and Naive_FPKM_40/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>2 and EM_FPKM_0<2 and not(EM_FPKM_40 >2 and EM_FPKM_40/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>2)
Inducible at 150 in Naive not EM				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where Naive_FPKM_0<2 and Naive_FPKM_150 >2 and Naive_FPKM_150/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>2 and EM_FPKM_0<2 and not(EM_FPKM_150 >2 and EM_FPKM_150/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>2)
Higly Inducible at 40 in Naive not EM				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where Naive_FPKM_0<2 and Naive_FPKM_40 >2 and Naive_FPKM_40/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>10 and EM_FPKM_0<2 and not(EM_FPKM_40 >2 and EM_FPKM_40/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>10)
Higly Inducible at 150 in Naive not EM				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where Naive_FPKM_0<2 and Naive_FPKM_150 >2 and Naive_FPKM_150/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>10 and EM_FPKM_0<2 and not(EM_FPKM_150 >2 and EM_FPKM_150/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>10)
Inducible at 40 EM not Naive				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_40 >2 and EM_FPKM_40/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>2 and Naive_FPKM_0<2 and not(Naive_FPKM_40 >2 and Naive_FPKM_40/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>2)
Inducible at 150 EM not Naive				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_150 >2 and EM_FPKM_150/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>2 and Naive_FPKM_0<2 and not(Naive_FPKM_150 >2 and Naive_FPKM_150/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>2)
Higly Inducible at 40 EM not Naive				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_40 >2 and EM_FPKM_40/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>10 and Naive_FPKM_0<2 and not(Naive_FPKM_40 >2 and Naive_FPKM_40/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>10)
Higly Inducible at 150 EM not Naive				
select chrom,txStart,txStart,strand from expirements.RNASEQ_CD4_CUFFLINKS where EM_FPKM_0<2 and EM_FPKM_150 >2 and EM_FPKM_150/IF(EM_FPKM_0<0.5,0.5,EM_FPKM_0)>10 and Naive_FPKM_0<2 and not(Naive_FPKM_150 >2 and Naive_FPKM_150/IF(Naive_FPKM_0<0.5,0.5,Naive_FPKM_0)>10)
