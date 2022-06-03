<<<<<<< Updated upstream
print("Hello World")
print("greenJoa")

print("singjun")
=======
import pymysql
import requests
from bs4 import BeautifulSoup
from datetime import datetime

def open_db():  #DB 오픈 함수 
    conn = pymysql.connect(host='localhost',user='root',password='K@ng0119',db='movies')
    cur = conn.cursor(pymysql.cursors.DictCursor)
    return conn,cur

def close_db(conn,cur): # DB 클로즈 함수
    cur.close()
    conn.close()
    
def gen_movie_list(): # 네이버 현재상영영화 페이지에서 크롤링하여 DB에 넣어주는 함수
    URL = "https://movie.naver.com/movie/running/current.naver#"#네이버 현재상영영화 URL
    resp = requests.get(URL)
    soup = BeautifulSoup(resp.text,"lxml")
    
    #각 애트리뷰트에 들어갈 값을 크롤링
    movie_list = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li')
    title = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > dl > dt > a')
    netizen_rate = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > dl > dd.star > dl > dd:nth-child(2) > div > a > span.num')
    netizen_count = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > dl > dd.star > dl > dd:nth-child(2) > div > a > span.num2 > em')
    scope = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > dl > dd:nth-child(3) > dl > dd:nth-child(2) > span.link_txt')
    playing_opening_time = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > dl > dd:nth-child(3) > dl > dd:nth-child(2)')
    director = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > dl > dd:nth-child(3) > dl > dd:nth-child(4) > span')
    image = soup.select('#content > div.article > div:nth-child(1) > div.lst_wrap > ul > li > div > a > img')
    enter_date = datetime.now()
    
    #open_db를 하고 create_sql과 insert_sql, buffer 선언
    conn, cur = open_db()
    conn2, cur2 = open_db()
    create_sql = """create table movie(
	id int auto_increment primary key,
	title varchar(200),
    movie_rate varchar(200),
    netizen_rate varchar(200),
    netizen_count varchar(200),
    journalist_score varchar(200),
    journalist_count varchar(200),
    scope varchar(200),
    playing_time varchar(200),
    opening_date varchar(200),
    director varchar(200),
    image varchar(200),
    enter_date varchar(200)
    );"""
    insert_sql = """insert into movie(title,movie_rate,netizen_rate,netizen_count,journalist_score,journalist_count,scope,playing_time,opening_date,director,image,enter_date) 
    values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    buffer =[]
    
    #버퍼에 각 애트리뷰트에 넣어줄 텍스트 값을 반복문으로 넣어준다
    for i in range(0,len(title)):
        title2 = title[i].get_text()
        netizen_rate2 = netizen_rate[i].get_text()
        netizen_count2 = netizen_count[i].get_text()
        #journalist_score, movie_rate, journalist_count는 없는 경우도 있으므로 예외처리를 해주어 없으면 NULL을 넣어주게 하였다.
        try:
            journalist_score = movie_list[i].select("dl > dd.star > dl > dd:nth-child(4) > div > a > span.num")[0].get_text()
        except:
            journalist_score = "NULL"
        try:
            journalist_count = movie_list[i].select("dl > dd.star > dl > dd:nth-child(4) > div > a > span.num2 >em")[0].get_text()    
        except:
            journalist_count="NULL"
        try:
            movie_rate2 = movie_list[i].select("dl > dt > span")[0].get_text()
        except:
            movie_rate2 = "NULL"
        #scope와 director는 두개 이상 있는 경우가 있었으므로 반복문으로 모두 넣어주었다.
        scope2 = scope[i].select("a")
        scope3=""
        for j in range(0,len(scope2)):
            if j!=0:
                scope3+=","
            scope3+=scope2[j].get_text()
        director2=director[i].select("a")
        director3=""
        for j in range(0,len(director2)):
            if j!=0:
                director3+=","
            director3+=director2[j].get_text()
        #opening_date와 playing_time은 태그 내의 text로 들어가 있었기에 한번 더 파싱하였다.
        opening_date=playing_opening_time[i].get_text().split("|")[2].replace("\t","").strip()
        playing_time=playing_opening_time[i].get_text().split("|")[1].replace("\t","").strip()
        image2=image[i].get("src")
        t = (title2,movie_rate2,netizen_rate2,netizen_count2,journalist_score,journalist_count,scope3,playing_time,opening_date,director3,image2,enter_date)
        buffer.append(t)
        
    #테이블을 생성하고, 버퍼를 executemany를 사용하여 DB에 넣어주었다.
    cur2.execute(create_sql)
    conn2.commit()
    cur.executemany(insert_sql,buffer)
    conn.commit()
    
    close_db(conn,cur)
    close_db(conn2,cur2)
    
if __name__ == '__main__':
    gen_movie_list()
>>>>>>> Stashed changes
