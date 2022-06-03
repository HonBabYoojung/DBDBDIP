use dbproject_navermovie;

# Movies 테이블
create table Movies(
	movie_id int primary key auto_increment,
    title varchar(50) not null,
    movie_code int not null,
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

# Scope 테이블
create table Scope(
	scope_id int primary key auto_increment,
    movie_id int,
    scopeName varchar(10),
    foreign key (movie_id) references Movies(movie_id)
);

# Director 테이블
create table Director(
	d_id int primary key auto_increment,
    movie_id int,
    directorName varchar(20),
    foreign key (movie_id) references Movies(movie_id)
);