# 각자 스키마 이름 넣기
use dbproject_navermovie;

# Movies 테이블
create table Movies(
	movie_code integer not null primary key,
    title varchar(200) not null,
    summary varchar(500),
    audience_rate float,
    audience_count varchar(10),
    journalist_rate float, 
    journalist_count int, 
    playing_time int,
    opening_date date,
    manufacture_year int,
    image varchar(100),
    totalAudience int
);

alter table Movies modify title mediumtext;
alter table Movies modify summary mediumtext;


# text가 너무 클시에 위의 alter mediumtext 필요!

# Scope 테이블
create table Scope(
	scope_id int primary key auto_increment,
	movie_code int not null,
    scopeName varchar(100),
    foreign key (movie_code) references Movies(movie_code)
);

alter table Scope modify scopeName mediumtext;

# Director 테이블
create table Director(
	d_id int primary key auto_increment,
    movie_code int,
    directorName varchar(100),
    filmoCode int,
    foreign key (movie_code) references Movies(movie_code)
);

alter table Director modify directorName mediumtext;

# Cast 테이블
create table MovieCast (
	cast_id int primary key auto_increment,
    movie_code int,
    castName varchar(100),
    mainorsub varchar(10),
    roleName varchar(100),
    castImg varchar(300),
    foreign key (movie_code) references Movies(movie_code)
);

alter table MovieCast modify castName mediumtext;
alter table MovieCast modify roleName mediumtext;
alter table MovieCast modify castImg mediumtext;