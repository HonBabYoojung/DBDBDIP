import enum
from inspect import classify_class_attrs
import pymysql # pymysql를 import
import urllib.request 
from bs4 import BeautifulSoup # html을 수프객체로 만들어서 데이터 추출에 도움을 줌

# db connection 설정
def open_db() : 
    conn = pymysql.Connect(host='localhost', user='root', password='Shin5633^^', db='dbproject_navermovie')
    cur = conn.cursor(pymysql.cursors.DictCursor)
    return conn, cur

# cursor와 db.connection 닫기
def close_db(conn, cur) :
    cur.close()
    conn.close()

# Movies 테이블 데이터 크롤링 하는 함수
def gen_movie_table() :
    
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into movies(movie_code, title, summary, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year, image, totalAudience)
                values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
    
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"+"&page=" + str(pageNum)
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        
        for i, a in enumerate(a_list):
            # 영화 제목 title
            
            if a["href"].find("/movie") != -1 :
            
                title = a.get_text()

                # 영화 코드 code
                try:
                    codeList = a["href"].split("=")
                    movie_code = int(codeList[1])
                except: 
                    movie_code = None

                # 영화 상세성보 url -> 새로운 soup 객체 생성
                movie_url = "https://movie.naver.com" + a["href"]


                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")

                # 영화 줄거리
                try :
                    summary = movie_soup.find("p", class_="con_tx").get_text()
                except:
                    summary = None

                # 관람객 평점(네티즌 평점과 관람객 평점 포함되어 있는 거임!)
                try: 
                    audience_rate = float(movie_soup.find("div", class_="netizen_score").find("div", class_="sc_view").find("div", class_="star_score").find("em").get_text())
                except:
                    audience_rate = None

                # 관람객 평점에 참여한 명수 -> int로 하니까 인식을 못함...varchar로 일단 해둠
                try:
                    audience_count = str(movie_soup.find("div", class_="netizen_score").find("span", class_="user_count").find("em").get_text())
                except:
                    audience_count = None

                # 기자, 평론가 평점
                try:    
                    journalist_rate = float(movie_soup.find("div", class_="special_score").find("div", class_="star_score").find("em").get_text())
                except:
                    journalist_rate = None

                # 기자, 평론가 평점에 참여한 명수
                try: 
                    journalist_count = int(movie_soup.find("div", class_="special_score").find("span", class_="user_count").find("em").get_text())
                except: 
                    journalist_count = None



                # 상영시간을 위한 요소들 & 상영날짜
                try :
                    info_list = movie_soup.find("dl", class_="info_spec").find_all("dd")[0]
                    span_list = info_list.find("p").find_all("span")
                    playing_time = int(span_list[2].get_text()[:-2])
                except: 
                    playing_time = None


                # 개봉날짜를 위한 요소들 & 개봉날짜
                try:
                    o1 = span_list[3].find_all("a")[0].get_text()
                    o2_list = span_list[3].find_all("a")[1].get_text().split('.')
                    opening_date = o1 + "-" + o2_list[1] + "-" + o2_list[2]

                except: 
                    opening_date = None

                # 제작 년도
                try: 
                    manufacture_year = int(soup.find_all("ul", class_="detail")[i].find_all("li")[0].find("a").get_text())
                except: 
                    manufacture_year = None

                # 포스터 이미지 url
                try: 
                    image = movie_soup.find("div", class_="poster").find("img")["src"]
                except:
                    image = None

                # 누적 관람객 수
                try:
                    totalAudience = int(movie_soup.find("div", class_="step9_cont").find("p").get_text().split("명")[0])

                except:
                    totalAudience = None
                    
                

                # movie 테이블에 넣을 튜플
                tuple = (movie_code, title, summary, audience_rate, audience_count, journalist_rate, journalist_count, playing_time, opening_date, manufacture_year, image, totalAudience)

                # buffer배열에 튜플 넣어주기
                buffer.append(tuple)

                if i % 1000 == 0 :
                    # executemany(sql문, 튜플을 담은 list)
                    cur.executemany(insert_sql, buffer)
                    # db에 저장하기 위해 conn.commit() 작성
                    conn.commit()
                    # 추가하였으면 다시 buffer 배열 비워주기
                    print("%d rows" %i)
                    buffer = []
            

        # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

# Scope 테이블    
def gen_scope_table() :
    
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into scope(movie_code, scopeName)
                values(%s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"+"&page=" + str(pageNum)
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for index, a in enumerate(a_list):
            # 영화 제목 title
            print(count)
            if a["href"].find("/movie") != -1 :
                
                codeList = a["href"].split("=")
                movie_code = int(codeList[1])
            
                movie_url = "https://movie.naver.com" + a["href"]
                
                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")
                try: 
                    scopeList = movie_soup.find("dl", class_="info_spec")
                    scopeA = scopeList.find_all("a")
                    sl = []
                    for scope in scopeA: 

                        if "/movie/sdb/browsing/bmovie.naver?genre=" in scope['href'] : # 상세정보 페이지 내에 장르적힌 a태그 찾기
                            tuple = (movie_code, scope.get_text())
                            # buffer배열에 튜플 넣어주기
                            sl.append(tuple)
                    if len(sl) == 0 :
                        buffer.append((movie_code, None))
                    
                    else :    
                        for s in sl :
                            buffer.append(s)
                except:
                    buffer.append((movie_code, None))
                
                # 중복값 제거
                bufferset = set(buffer)
                buffer = list(bufferset)
                buffer.sort()
                count += 1
                
            

                if len(buffer) % 1000 == 0 :
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
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

# Cast table
def gen_cast_table() :
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into moviecast(movie_code, castName, mainorsub, roleName, castImg)
                values(%s, %s, %s, %s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003&page=" + str(pageNum).strip()
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for i, a in enumerate(a_list):
            # 영화 제목 title
            print(count)
            if a["href"].find("/movie") != -1 :
                
                codeList = a["href"].split("=")
                movie_code = int(codeList[1])
            
                movie_url = "https://movie.naver.com" + a["href"]
            
                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")
                
                isCast = movie_soup.find("dt", class_="step3")
                if isCast == None:
                    buffer.append((movie_code, None, None, None, None))  
                
                else: 
                    
                    curl = "https://movie.naver.com/movie/bi/mi/detail.naver?code=" + str(movie_code)
                    csoup = BeautifulSoup(urllib.request.urlopen(curl).read(), "html.parser")
                    
                    castul = csoup.find("ul", class_="lst_people").find_all("li")
                    #print(castul)
                    
                    #print(directorList)
                    for cast in castul :
                        #print(movie_id,"의 감독 :", director)
                        if cast.find("p", class_="p_thumb") :
                            try:
                                castImg = cast.find("p", class_="p_thumb").find("img")["src"]
                            except:
                                castImg = None
                            try: 
                                castName = cast.find("div", class_="p_info").find("a").get_text()
                            except:
                                castName = None
                                
                            try: 
                                mainorsub = cast.find("p", class_="in_prt").find("em").get_text()
                                
                            except: 
                                mainorsub = None
                                
                            try:
                                roleName = cast.find("p", class_="pe_cmt").find("span").get_text()
                                
                            except: 
                                roleName = None

                            tuple = (movie_code, castName, mainorsub, roleName, castImg)
                            buffer.append(tuple)



                # 중복 제거를 위한 절차
                buffer_set = set(buffer)
                buffer = list(buffer_set)
                count += 1
                

                if len(buffer) % 1000 == 0 :
                    # executemany(sql문, 튜플을 담은 list)
                    cur.executemany(insert_sql, buffer)
                    # db에 저장하기 위해 conn.commit() 작성
                    conn.commit()
                    # 추가하였으면 다시 buffer 배열 비워주기
                    print("%d rows" %i)
                    buffer = []
            

        # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

def gen_photo_table() :
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into photo(movie_code, imageType, PhotoLink)
                values(%s, %s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003&page=" + str(pageNum).strip()
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for i, a in enumerate(a_list):
            # 영화 제목 title
            print(count)
            
            if a["href"].find("/movie") != -1 :
                
                codeList = a["href"].split("=")
                movie_code = int(codeList[1])
                print(movie_code)
                curl = "https://movie.naver.com/movie/bi/mi/photoView.naver?code=" + str(movie_code)
                csoup = BeautifulSoup(urllib.request.urlopen(curl).read(), "html.parser")                
                isPhoto = csoup.find("span", class_="count")
                
                if isPhoto == None:
                    buffer.append((movie_code, None, None))  
                
                else:
                    
                    photoul = csoup.find_all("li", class_="_list")
                    #print(castul)
                    
                    #print(directorList)
                    for photo in photoul :
                        imageType = photo.find("img")["alt"]
                        PhotoLink = photo.find("img")["src"]
                        tuple = (movie_code, imageType, PhotoLink)
                        buffer.append(tuple)
                


                # 중복 제거를 위한 절차
                buffer_set = set(buffer)
                buffer = list(buffer_set)
                buffer.sort()
                count += 1
                
                    
                if len(buffer) % 1000 == 0 :
                    # executemany(sql문, 튜플을 담은 list)
                    cur.executemany(insert_sql, buffer)
                    # db에 저장하기 위해 conn.commit() 작성
                    conn.commit()
                    # 추가하였으면 다시 buffer 배열 비워주기
                    print("%d rows" %i)
                    buffer = []
            

        # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

def gen_video_table() :
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into Video(movie_code,videoName,videoImgsrc,videoLink)
                values(%s, %s, %s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003&page=" + str(pageNum).strip()
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for i, a in enumerate(a_list):
            # 영화 제목 title
            print(count, end=" ")
            if a["href"].find("/movie") != -1 :
                
                codeList = a["href"].split("=")
                movie_code = int(codeList[1])
            
                movie_url = "https://movie.naver.com" + a["href"]
            
                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")
                
                isVideo = movie_soup.find("ul", class_="video_thumb")
                if isVideo is None:
                    buffer.append((movie_code, None,None,None))
                    print("No Video")
                
                else:
                    
                    vlist = isVideo.find_all("li")
    
                    for i, video in enumerate(vlist) :
                        videoName = video.find("a",class_="video_obj")["title"]
                        videoImgsrc = video.find("img")["src"]
                        videoLink = "https://movie.naver.com" + video.find("a",class_="video_obj")["href"]
                        
                        tuple = (movie_code,videoName,videoImgsrc,videoLink)
                        buffer.append(tuple)

                # 중복 제거를 위한 절차
                buffer_set = set(buffer)
                buffer = list(buffer_set)
                count += 1
                
                

                if len(buffer) % 1000 == 0 :
                    # executemany(sql문, 튜플을 담은 list)
                    cur.executemany(insert_sql, buffer)
                    # db에 저장하기 위해 conn.commit() 작성
                    conn.commit()
                    # 추가하였으면 다시 buffer 배열 비워주기
                    print("%d rows" %i)
                    buffer = []
            

        # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

def gen_country_table() :
    conn, cur = open_db()
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into Country(movie_code, countryName)
                values(%s, %s)"""
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"+"&page=" + str(pageNum)
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for index, a in enumerate(a_list):
            # 영화 제목 title
            print(count, end=" ")
            if a["href"].find("/movie") != -1 :
                
                codeList = a["href"].split("=")
                movie_code = int(codeList[1])
                movie_url = "https://movie.naver.com" + a["href"]
                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")
                try:                 
                    links = movie_soup.find("dl", class_="info_spec").find_all("a")
                    sl = []
                    for country in links: 

                        if "/movie/sdb/browsing/bmovie.naver?nation=" in country['href'] : # 상세정보 페이지 내에 장르적힌 a태그 찾기
                            tuple = (movie_code, country.get_text())
                            # buffer배열에 튜플 넣어주기
                            print(country.get_text())
                            sl.append(tuple)
                    if len(sl) == 0 :
                        buffer.append((movie_code, None))
                    else :    
                        for s in sl :
                            buffer.append(s)
                except:
                    buffer.append((movie_code, None))
                # 중복값 제거
                bufferset = set(buffer)
                buffer = list(bufferset)
                buffer.sort()
                count += 1
                
                if len(buffer) % 1000 == 0 :
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
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

def gen_rate_table() :
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # movie 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into Rate(movie_code, starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum)
                values(%s, %s, %s, %s, %s, %s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003&page=" + str(pageNum).strip()
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for i, a in enumerate(a_list):
            # 영화 제목 title
            #print(count)
            if a["href"].find("/movie") != -1 :
                print(count)
                codeList = a["href"].split("=")
                movie_code = int(codeList[1])
            
                movie_url = "https://movie.naver.com" + a["href"]
            
                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")
                
                isRate = movie_soup.find("div", class_="score_result")
                
                if isRate == None:
                    buffer.append((movie_code, None, None, None, None, None, None))  
                
                else: 
                    
                    rateul = movie_soup.find("div", class_="score_result").find("ul").find_all("li")
                    
                    for i, rate in enumerate(rateul) :
                        starScore = rate.find("div", class_= "star_score").find("em").get_text()
                        rateInfo = rate.find("div", class_="score_reple").find("p").get_text().strip()
                        writerId = rate.find("div", class_="score_reple").find("dl").find("dt").find_all("em")[0].find("a").find("span").get_text()
                        rateDate = rate.find("div", class_="score_reple").find("dl").find("dt").find_all("em")[1].get_text()
                        likeNum = rate.find("a", class_="_sympathyButton").find("strong").get_text()
                        dislikeNum = rate.find("a", class_="_notSympathyButton").find("strong").get_text()
                        buffer.append((movie_code, starScore, rateInfo, writerId, rateDate, likeNum, dislikeNum))  

                # 중복 제거를 위한 절차
                buffer_set = set(buffer)
                buffer = list(buffer_set)
                count += 1

                if len(buffer) % 1000 == 0 :
                    # executemany(sql문, 튜플을 담은 list)
                    cur.executemany(insert_sql, buffer)
                    # db에 저장하기 위해 conn.commit() 작성
                    conn.commit()
                    # 추가하였으면 다시 buffer 배열 비워주기
                    print("%d rows" %i)
                    buffer = []
            

        # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)

def gen_filmo_table() :
    conn, cur = open_db()
    
    # 네이버 현재상영영화 사이트 url
    # 15세 관람가 영화 리스트 링크
    url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003"
    
    # request로 받아온 텍스트형태의 html를 soup 객체로 변환
    soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
    
    # ul.lst_detail_t1 -> 영화 정보 리스트 -> 여기서 li 태그들을 모두 가져옴
    ul = soup.find("ul", class_="directory_list").find_all("li")
    # ul은 list 형태
    
    # Filmography 테이블에 행들을 추가하기 위한 sql문
    insert_sql = """insert into Filmography(movie_code, directorName, movieTitle, movieImg)
                values(%s, %s, %s, %s)"""
    
    # 받아온 데이터 튜플들을 넣어둘 buffer 배열
    buffer = []
    count = 0
    
    for pageNum in range(1, 691):
        
        url = "https://movie.naver.com/movie/sdb/browsing/bmovie.naver?grade=1001003&page=" + str(pageNum).strip()
        soup = BeautifulSoup(urllib.request.urlopen(url).read(), "html.parser")
        a_list = soup.find("ul", class_="directory_list").find_all("a")

        for i, a in enumerate(a_list):
            
            if a["href"].find("/movie") != -1 :
                
                codeList = a["href"].split("=")
                
                # 영화 코드값
                movie_code = int(codeList[1])
            
                movie_url = "https://movie.naver.com" + a["href"]
            
                movie_soup = BeautifulSoup(urllib.request.urlopen(movie_url).read(), "html.parser")
                
                # 영화의 감독 정보가 있는지 없는지 판별
                isDirector = movie_soup.find("dt", class_="step2")
                if isDirector == None:
                    buffer.append((movie_code, None, None, None))  
                
                else: 
                    # 감독이 여러명 존재할 경우, 각 감독들을 directorList에 넣어주기
                    directorList = movie_soup.find("dl", class_="info_spec").find_all("dd")[1].find("p").find_all("a")
                    
                    for i, director in enumerate(directorList) :
                        #  각 감독마다의 필모그래피 페이지로 넘어가기 
                        durl = "https://movie.naver.com" + director["href"]
                        dsoup = BeautifulSoup(urllib.request.urlopen(durl).read(), "html.parser")
                        
                        titleList = dsoup.find_all("p", class_="pilmo_thumb")
                        
                        for i, s in enumerate(titleList) :
                            # 필모그래피 영화 이름
                            movieTitle = s.find("a").find("img")["alt"]
                            
                            # 필모그래피 영화 이미지 주소 
                            movieImg = s.find("a").find("img")["src"]
                            tuple = (movie_code, director.get_text(), movieTitle, movieImg)
                            # buffer배열에 튜플 넣어주기
                            buffer.append(tuple)
                        


                # 중복 제거를 위한 절차
                buffer_set = set(buffer)
                buffer = list(buffer_set)
                buffer.sort()
                count += 1

                if len(buffer) % 1000 == 0 :
                    # executemany(sql문, 튜플을 담은 list)
                    cur.executemany(insert_sql, buffer)
                    # db에 저장하기 위해 conn.commit() 작성
                    conn.commit()
                    # 추가하였으면 다시 buffer 배열 비워주기
                    print("%d rows" %i)
                    buffer = []
            

        # buffer 배열에 튜플 남았으면, 남은 튜플 insert
    if buffer :
        cur.executemany(insert_sql, buffer)
        conn.commit()
    
    # # cursor 및 db connection 닫기
    close_db(conn, cur)
        

# 실행하는 파일이 자기자신일 경우, 함수 실행
if __name__ == '__main__' :
    gen_movie_table()
    gen_scope_table()
    gen_cast_table()
    gen_country_table()
    gen_photo_table()
    gen_country_table()
    gen_video_table()
    gen_rate_table()
    gen_filmo_table()
