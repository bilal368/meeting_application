create user 'devuser'@'%' identified by 'P@ssw0rd'; grant all privileges on  *.*  to 'devuser'@'%'; flush privileges;

create database if not exists mtn;

use mtn;

CREATE TABLE if NOT EXISTS meeting (
	meeting_id INT(11) NOT NULL AUTO_INCREMENT,
  meeting_topic VARCHAR(1024) NOT NULL ,
	scheduled_date DATETIME NOT NULL,
	zoom_meeting_id BIGINT(11) NOT NULL,
  email VARCHAR(64) DEFAULT NULL,
	zoom_start_url VARCHAR(1024) DEFAULT NULL,
	zoom_join_url VARCHAR(1024) DEFAULT NULL,
	date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (meeting_id)
);

CREATE TABLE if NOT EXISTS mtnUser  (
  user_id int(11) NOT NULL AUTO_INCREMENT,
  zoom_user_id VARCHAR(32) DEFAULT NULL,
  email_id varchar(40) DEFAULT NULL,
  type tinyint(1) DEFAULT 1 COMMENT '1-basic; 2-licensed',
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
); 
CREATE TABLE if NOT EXISTS invitedMeetings  (
  invite_id int(11) NOT NULL AUTO_INCREMENT,
  email VARCHAR(1024) DEFAULT NULL,
  zoom_meeting_id BIGINT(11) NULL DEFAULT NULL,
  invite_by_email varchar(1024) DEFAULT NULL,
  zoom_join_url varchar(1024) DEFAULT NULL,
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (invite_id)
);
CREATE TABLE if NOT EXISTS tb_organisation (
  orgId int(11) NOT NULL AUTO_INCREMENT,
  orgName varchar(30) DEFAULT NULL,
  domainName VARCHAR(30) DEFAULT NULL,
  timezone VARCHAR(30) DEFAULT NULL,
  emailTemplate VARCHAR(1000) DEFAULT NULL,
  PRIMARY KEY (orgId)
); 
CREATE TABLE if NOT EXISTS tb_oauthtoken (
  tokenId int(11) NOT NULL AUTO_INCREMENT,
  oauthToken varchar(30) DEFAULT NULL,
  tokenTime VARCHAR(30) DEFAULT NULL,
  emailTemplate VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (tokenId)
);
CREATE TABLE if NOT EXISTS zoomUser  (
  user_id int(11) NOT NULL AUTO_INCREMENT,
  zoom_user_id VARCHAR(32) DEFAULT NULL,
  email_id varchar(40) DEFAULT NULL,
  type tinyint(1) DEFAULT 1 COMMENT '1-basic; 2-licensed user',
  date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
); 
CREATE TABLE if NOT EXISTS mtnUser (
	user_id INT(11) NOT NULL AUTO_INCREMENT,
	zoom_user_id VARCHAR(32)  DEFAULT NULL ,
	email_id VARCHAR(40)  DEFAULT NULL,
	type TINYINT(1)  DEFAULT '1' COMMENT '1-nonlicensed user; 2- licensed user',
	date_created DATETIME  DEFAULT current_timestamp(),
	authetication_token VARCHAR(50)  DEFAULT NULL,
	password VARCHAR(1000)  DEFAULT NULL ,
	PRIMARY KEY (user_id) 
);
