# 각자 스키마 이름 넣기
create database dbproject_navermovie;
use dbproject_navermovie;
drop database dbproject_navermovie;

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
select count(*) from Movies;
select * from Movies;

# text가 너무 클시에 위의 alter mediumtext 필요!

# Scope 테이블
create table Scope(
	scope_id int primary key auto_increment,
	movie_code int not null,
    scopeName varchar(100),
    foreign key (movie_code) references Movies(movie_code)
);

alter table Scope modify scopeName mediumtext;

# MovieCast 테이블 (출연진)
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

# Photo 테이블
create table Photo (
	photo_id int primary key auto_increment,
    movie_code int NOT NULL,
    imageType varchar(50),
    photoLink varchar(500),
    foreign key (movie_code) references Movies(movie_code)
);

alter table Photo modify photoLink mediumtext;

# Video 테이블
create table Video(
	video_id int primary key auto_increment,
    movie_code int NOT NULL,
    videoName varchar(50),
    videoImgsrc varchar(100),
    videoLink varchar(100),
    foreign key (movie_code) references Movies(movie_code)
);
alter table Video modify videoName mediumtext;
alter table Video modify videoLink mediumtext;
alter table Video modify videoImgsrc mediumtext;

# Country 테이블
create table Country(
	country_id int auto_increment primary key auto_increment,
	movie_code int NOT NULL,
	countryName varchar(50),
    foreign key (movie_code) references Movies(movie_code)
);

alter table Country modify countryName mediumtext;

# Rate 테이블
create table Rate(
	rate_id  int auto_increment primary key auto_increment,
	movie_code int NOT NULL,
	starScore int,
	rateInfo varchar(300),
	writerId varchar(100),
	rateDate varchar(200),
	likeNum int,
	dislikeNum int,
    foreign key (movie_code) references Movies(movie_code)
);
alter table Rate modify rateInfo mediumtext;
alter table Rate modify writerId mediumtext;
alter table Rate modify rateDate mediumtext;

# Filmography 테이블
create table Filmography (
	f_id int primary key auto_increment,
    movie_code int NOT NULL,
    directorName varchar(20),
    movieTitle varchar(100),
    movieImg varchar(300),
    foreign key (movie_code) references Movies(movie_code)
);

alter table Filmography modify directorName mediumtext;
alter table Filmography modify movieTitle mediumtext;
alter table Filmography modify movieImg mediumtext;