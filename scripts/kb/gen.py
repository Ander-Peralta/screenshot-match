import sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from data import AREAS, C, R
ids={x['id'] for x in C}
subs={}
for a,an,ss in AREAS:
    for s,sn in ss: subs[s]=a
bad=[x for x in C if x['sub'] not in subs]
assert not bad, bad
for a,t,b,_ in R:
    assert a in ids and b in ids, (a,t,b)
assert len(ids)==len(C)
def q(s): return "'"+s.replace("'","''")+"'"
out=[]
out.append("INSERT INTO public.categories(id,name,parent_id,sort) VALUES ('fisica','Física',NULL,0);")
for i,(a,an,ss) in enumerate(AREAS):
    out.append(f"INSERT INTO public.categories(id,name,parent_id,sort) VALUES ({q(a)},{q(an)},'fisica',{i+1});")
    for j,(s,sn) in enumerate(ss):
        out.append(f"INSERT INTO public.categories(id,name,parent_id,sort) VALUES ({q(s)},{q(sn)},{q(a)},{j+1});")
vals=[]
for x in C:
    syn="ARRAY["+",".join(q(s.strip()) for s in x['synonyms'].split(',') if s.strip())+"]::text[]"
    vals.append(f"({q(x['id'])},{q(x['name'])},{q(x['kind'])},{q(x['sub'])},{q(x['definition'])},{q(x['formula'])},{q(x['units'])},{syn},{q(x['conditions'])},{q(x['level'])})")
out.append("INSERT INTO public.concepts(id,name,kind,category_id,definition,formula,units,synonyms,conditions,level) VALUES\n"+",\n".join(vals)+";")
seen=set(); rv=[]
for a,t,b,ctx in R:
    k=(a,t,b)
    if k in seen: continue
    seen.add(k); rv.append(f"({q(a)},{q(t)},{q(b)},{q(ctx)})")
out.append("INSERT INTO public.relations(source_id,type_id,target_id,context) VALUES\n"+",\n".join(rv)+";")
open('/tmp/kb/seed.sql','w').write("\n".join(out))
print(len(C),len(rv))
