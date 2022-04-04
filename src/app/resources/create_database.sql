# MySQL scripts for dropping existing tables and recreating the database table structure


### DROP EVERYTHING ###
# Tables/views must be dropped in reverse order due to referential constraints (foreign keys).

DROP TABLE IF EXISTS `auction_watching`;
DROP TABLE IF EXISTS `auction_bid`;
DROP TABLE IF EXISTS `auction`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `category`;

### TABLES ###
# Tables must be created in a particular order due to referential constraints i.e. foreign keys.

CREATE TABLE `user` (
  `id`          int(11)       NOT NULL AUTO_INCREMENT,
  `email`       varchar(128)  NOT NULL,
  `first_name`  varchar(64)   NOT NULL,
  `last_name`   varchar(64)   NOT NULL,
  `image_filename`  varchar(64)   DEFAULT NULL,
  `password`    varchar(256)  NOT NULL COMMENT 'Only store the hash here, not the actual password!',
  `auth_token`  varchar(256)  DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`email`)
);

CREATE TABLE `category` (
  `id`         int(11)     NOT NULL   AUTO_INCREMENT,
  `name`       varchar(24) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name` )
);

CREATE TABLE `auction` (
  `id`                          int(11)       NOT NULL AUTO_INCREMENT,
  `title`                       VARCHAR(128)  NOT NULL,
  `description`                 VARCHAR(2048) NOT NULL,
  `end_date`                    DATETIME      NOT NULL,
  `image_filename`              VARCHAR(64)   NULL,
  `reserve`                     int(11)       DEFAULT 0 NULL,
  `seller_id`                   int(11)       NOT NULL,
  `category_id`            int(11)       NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY (`title`, `seller_id` ),
  FOREIGN KEY (`seller_id`) REFERENCES `user` (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
);

CREATE TABLE `auction_bid` (
  `id`   int(11)         NOT NULL AUTO_INCREMENT,
  `auction_id`           int(11)    NOT NULL,
  `user_id`              int(11)    NOT NULL,
  `amount`               int(11)    NOT NULL,
  `timestamp`     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`auction_id`, `user_id`, `amount`),
  FOREIGN KEY (`user_id`)            REFERENCES `user` (`id`),
  FOREIGN KEY (`auction_id`)         REFERENCES `auction` (`id`)
);
