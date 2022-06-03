import pymysql # pymysql를 import
import urllib.request 
from bs4 import BeautifulSoup # html을 수프객체로 만들어서 데이터 추출에 도움을 줌

# db connection 설정
def open_db() : 
    conn = pymysql.Connect(host='localhost', user='root', password='Shin5633^^', db='navermovie')
    cur = conn.cursor(pymysql.cursors.DictCursor)
    return conn, cur

# cursor와 db.connection 닫기
def close_db(conn, cur) :
    cur.close()
    conn.close()

# movie 데이터 크롤링 하는 함수
def gen_movie_table() :
    
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    url = "https://movie.naver.com/movie/running/current.naver"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="lst_detail_t1").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into movie(title, movie_rate, netizen_rate, netizen_count, journalist_score, journalist_count, scope, playing_time, opening_date, director, image)
                values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    
    for i, li in enumerate(ul):
        # 영화 제목
        title = li.find("dt", class_="tit").find("a").get_text()
        
        # 영화 등급(존재하지 않을땐 NULL값을 넣어야하므로 None값을 활용)
        if li.find("dt", class_="tit").find("span") :
            movie_rate = li.find("dt", class_="tit").find("span").get_text()
        else : 
            movie_rate = None
        
        # 첫번째 star_t1 -> 네티즌 평점 & 네티즌 평점 참여자 수
        # 두번째 star_t1 -> 기자,평론가 평점 & 기자,평론가 참여자 수
        star_li = li.find_all("div", class_="star_t1")
        
        
        for i, s in enumerate(star_li) :
            
            if len(star_li) == 2: # 네티즌, 기자, 평론가 모두 참여하였을 경우
                
                if i == 0: # 첫번째 star_t1
                    
                    netizen_rate = s.find("span", class_="num").get_text()
                    netizen_count = s.find("em").get_text()


                elif i == 1: # 두번째 star_t1
                    journalist_score = s.find("span", class_="num").get_text()
                    journalist_count = s.find("em").get_text()
                    
                    
            else: # 네티즌만 참여하였을 경우
                netizen_rate = s.find("span", class_="num").get_text()
                netizen_count = s.find("em").get_text()
                
                # 기자, 평론가 평점 및 참여자 수는 null 값
                journalist_score = None
                journalist_count = None


        # 첫번째 dd -> 개요, 상영시간, 개봉날짜 정보 지님
        # 두번째 dd -> 감독 정보 지님
        info_li = li.find("dl", class_="info_txt1").find_all("dd")
        
        for l in enumerate(info_li) :
            
            if l[0] == 0: # 첫번째 dd 
                # 첫번째 dd부분 중, span.link_txt 에 개요 정보 존재
                # 개요가 여러개 있을 경우, split()으로 리스트 형태로 모은 다음, join으로 하나의 문자열로 변형
                scope = "".join(l[1].find("span", class_="link_txt").get_text().split())
                
                # 개요, '|', 상영시간, '|' 개봉날짜 -> '|' 문자로 구분되어 있음
                timeAndDate = l[1].get_text().split()
                
                flag = False
                cnt = 0
                for t in timeAndDate :
                    
                    if flag == True: # '|' 바로 다음 정보를 얻기 위해 flag 변수 활용
                        if cnt == 0: # 첫번째 '|' 다음일 경우
                            playing_time = t # 상영시간
                            cnt += 1
                        else: # 두번째 '|' 다음일 경우
                            opening_date = t
                            
                        flag = False # flag를 False로 변경
                    
                    if t == '|' : # '|' 문자를 읽을 경우, flag 를 True로 설정
                        flag = True
                        
                
                
            elif l[0] == 1: # 두번째 dd부분에 감독 정보 존재
                director = l[1].get_text().strip()
                
            
            
            
        # 영화 대표 이미지 주소
        image = li.find("div", class_="thumb").find("img")["src"]
        
        # movie 테이블에 넣을 튜플
        tuple = (title, movie_rate, netizen_rate, netizen_count, journalist_score, journalist_count, scope, playing_time, opening_date, director, image)
        
        # buffer배열에 튜플 넣어주기
        buffer.append(tuple)
        
        if len(buffer) % 2 == 0 :
            # executemany(sql문, 튜플을 담은 list)
            cur.executemany(insert_sql, buffer)
            # db에 저장하기 위해 conn.commit() 작성
            conn.commit()
            # 추가하였으면 다시 buffer 배열 비워주기
            buffer = []
    
    # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # cursor 및 db connection 닫기
    close_db(conn, cur)
    
# 실행하는 파일이 자기자신일 경우, 함수 실행
if __name__ == '__main__' :
    gen_movie_table()