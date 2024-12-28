# Détection de localisation anormale avec des algorithmes de machine learning
  # Table de matière:
    I. Introduction
      1.	Contexte et objectifs
       1.1 Objectifs principaux
      2.  Vue d'ensemble du projet
      3.  Cas d'utilisation
    II. Architecture Technique
      1.	Structure du projet
      2.	Technologies utilisées
      3.	Conteneurisation et déploiement 
    III. Fonctionnalités
      1. Génération de code
      2. Interface utilisateur
    IV.	Guide d'installation
      1.	Prérequis
      2.  Installation et configuration
      3.  Déploiement

      
  # I.	Introduction
   # 1.	Contexte et objectifs
   Le projet de détection de localisation anormale est une solution innovante utilisant l'intelligence artificielle pour analyser en temps réel les données de géolocalisation 
   des flottes de véhicules. Le système apprend les schémas normaux de déplacement et détecte automatiquement les comportements inhabituels pouvant indiquer des risques 
   ou des inefficacités opérationnelles.
   # 1.1 Objectifs principaux:
     - Détection des anomalies basée sur des algorithmes ML
     - Génération d'alertes basée sur les anomalies détectées
     - Gestion des informations des véhicules
     - Gestion des comptes utilisateurs
   # 2.  Vue d'ensemble du projet
  Le projet utilise une architecture microservices pour garantir la modularité et la scalabilité. Chaque microservice est responsable d’une fonction spécifique, 
  allant de la gestion des véhicules à la détection des anomalies et aux notifications d’alertes. Le système est déployé avec Docker Compose, 
  facilitant ainsi l’orchestration des services.
   # 3. Cas d'utilisation
   Imaginons une entreprise de livraison qui souhaite surveiller ses camions en temps réel pour détecter des anomalies qui pourraient indiquer des problèmes, 
   comme un détour imprévu ou un arrêt prolongé. Ce système pourrait signaler ces anomalies, permettant à l'entreprise de réagir rapidement, 
   soit en contactant le conducteur, soit en ajustant l’itinéraire pour minimiser les impacts.   
  # II.	Architecture Technique
  # 1. Structure du projet
   Le projet est construit selon une architecture microservices, chaque microservice gère une fonctionnalité spécifique, voici les principaux composants :
   
        * Ace-Gateway (Spring Cloud)
         Service de passerelle API
         
        * Ace-Eureka (Spring Cloud)
         Service de découverte et registre des services
         
        * AnomalyDetectionService (Python)
         Service principal de détection des anomalies à l’aide de modèles de machine learning
         
        * AlertService (Spring boot)
         Service de Gestion et envoi des alertes
         
        * VehicleService (Spring boot)
         Service de Gestion des données des véhicules
         
        * UserService (Spring boot)
         Service de Gestion des utilisateurs
         
        * next-ace-front (Next.js)
        Service pour l'Application web principale 
        
   
   AceFulPj/
   
      ├── .idea                     
      
      ├── Ace-Eureka/               
            
      ├── Ace-Gateway/              
      
      ├── AlertService/             
      
      ├── AnomalyDetectionService/ 
      
      ├── UserService/              

      ├── VehicleService/  
      
      ├── next-ace-front/              
      
      ├── docker-compose.yml/          

      └── vehicle_service.sql/  

   # 2.	Technologies utilisées
   
        Backend : Spring Boot
        Frontend : Next.js
        Bases de données : MySQL
        Message Broker : Apache Kafka
        Conteneurisation : Docker, Docker Compose
        Registre de services : Eureka
        API Gateway : Spring Cloud Gateway
        Machine Learning : Implémentation dans Anomaly Detection Service
        CI/CD : Github actions
        Analyse de code : SonarQube
        Surveillance : Prometheus et Grafana
        
   # 3.	Conteneurisation et déploiement  
   
   Chaque microservice est encapsulé dans un conteneur Docker. L’orchestration des conteneurs est gérée par Docker Compose. Voici les étapes principales :
   
      * Définition des fichiers Dockerfile pour chaque service.
      * Configuration de docker-compose.yml pour démarrer tous les services simultanément.
      * Mise en place des pipelines CI/CD avec GitHub actions pour automatiser les tests, la construction des images Docker, et le déploiement.
      * Intégration de SonarQube pour assurer la qualité et la sécurité du code.
      * Intégration de Grafana et Prometheus pour la surveillance des microservices.
      
   # 3.1 Configuration Docker Compose

```yaml
version: '3.8'

services:
  # ---------------------
  # Prometheus
  # ---------------------
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - ace-network
    restart: always

  # ---------------------
  # Grafana
  # ---------------------
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    networks:
      - ace-network
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    restart: always

  # ---------------------
  # Eureka Service Registry
  # ---------------------
  eureka-server:
    build:
      context: ./Ace-Eureka
    container_name: ace-eureka
    ports:
      - "8761:8761"
    networks:
      - ace-network
    environment:
      - EUREKA_CLIENT_REGISTER_WITH_EUREKA=false
      - EUREKA_CLIENT_FETCH_REGISTRY=false
    restart: always

  # ---------------------
  # Zookeeper
  # ---------------------
  zookeeper:
    image: bitnami/zookeeper:latest
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
    networks:
      - ace-network

  # ---------------------
  # Kafka
  # ---------------------
  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: kafka
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      - KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,PLAINTEXT_HOST://0.0.0.0:29092
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,PLAINTEXT_HOST://147.79.115.242:29092
      - KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      - KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
    depends_on:
      - zookeeper
    networks:
      - ace-network
    restart: always

  # ---------------------
  # Gateway Service
  # ---------------------
  gateway-service:
    build:
      context: ./Ace-Gateway
    container_name: ace-gateway
    ports:
      - "8080:8080"
    networks:
      - ace-network
    depends_on:
      - eureka-server
    environment:
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
      - SPRING_PROFILES_ACTIVE=docker

  # ---------------------
  # Anomaly Detection Service
  # ---------------------
  anomaly-detection-service:
    build:
      context: ./AnomalyDetectionService
    container_name: anomaly-detection-service
    ports:
      - "5000:5000"
    networks:
      - ace-network
    depends_on:
      - gateway-service
      - kafka
      - vehicle-service
      - ace-frontend
    environment:
      - KAFKA_BROKER=kafka:9092
      - VEHICLE_SERVICE_URL=http://vehicle-service:8081

  # ---------------------
  # Vehicle Service
  # ---------------------
  vehicle-service:
    build:
      context: ./VehicleService
    container_name: vehicle-service
    ports:
      - "8081:8081"
    networks:
      - ace-network
    depends_on:
      - eureka-server
      - vehicle-db
      - gateway-service
      - kafka
    environment:
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://vehicle-db:3306/vehicle_service
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=vehicle_root_pass
      - SPRING_KAFKA_BOOTSTRAP-SERVERS=kafka:9092
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://147.79.115.242:8081/actuator/health"]
      timeout: 10s
      retries: 3

  # ---------------------
  # User Service
  # ---------------------
  user-service:
    build:
      context: ./UserService
    container_name: user-service
    ports:
      - "8082:8082"
    networks:
      - ace-network
    depends_on:
      - eureka-server
      - user-db
      - gateway-service
      - kafka
    environment:
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://user-db:3306/user_service
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=user_root_pass
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://147.79.115.242:8082/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ---------------------
  # Alert Service
  # ---------------------
  alert-service:
    build:
      context: ./AlertService
    container_name: alert-service
    ports:
      - "8083:8083"
    networks:
      - ace-network
    depends_on:
      - eureka-server
      - alert-db
      - gateway-service
      - kafka
    environment:
      - EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://ace-eureka:8761/eureka
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://alert-db:3306/alert_service
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=alert_root_pass
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://147.79.115.242:8083/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ---------------------
  # MySQL Databases
  # ---------------------
  vehicle-db:
    image: mysql:8
    container_name: vehicle-db
    ports:
      - "3307:3306"
    networks:
      - ace-network
    environment:
      - MYSQL_ROOT_PASSWORD=vehicle_root_pass
      - MYSQL_DATABASE=vehicle_service
    volumes:
      - ./vehicle_service.sql:/docker-entrypoint-initdb.d/vehicle_service.sql

  user-db:
    image: mysql:8
    container_name: user-db
    ports:
      - "3308:3306"
    networks:
      - ace-network
    environment:
      - MYSQL_ROOT_PASSWORD=user_root_pass
      - MYSQL_DATABASE=user_service

  alert-db:
    image: mysql:8
    container_name: alert-db
    ports:
      - "3309:3306"
    networks:
      - ace-network
    environment:
      - MYSQL_ROOT_PASSWORD=alert_root_pass
      - MYSQL_DATABASE=alert_service

  # ---------------------
  # phpMyAdmin Interfaces
  # ---------------------
  phpmyadmin-vehicle:
    image: phpmyadmin:latest
    container_name: phpmyadmin-vehicle
    depends_on:
      - vehicle-db
    ports:
      - "8181:80"
    environment:
      PMA_HOST: vehicle-db
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: vehicle_root_pass
    networks:
      - ace-network
    restart: always

  phpmyadmin-user:
    image: phpmyadmin:latest
    container_name: phpmyadmin-user
    depends_on:
      - user-db
    ports:
      - "8282:80"
    environment:
      PMA_HOST: user-db
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: user_root_pass
    networks:
      - ace-network
    restart: always

  phpmyadmin-alert:
    image: phpmyadmin:latest
    container_name: phpmyadmin-alert
    depends_on:
      - alert-db
    ports:
      - "8383:80"
    environment:
      PMA_HOST: alert-db
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: alert_root_pass
    networks:
      - ace-network
    restart: always

  # ---------------------
  # Nextjs Frontend
  # ---------------------
  ace-frontend:
    build:
      context: ./next-ace-front
    container_name: ace-frontend
    ports:
      - "3000:3000"
    networks:
      - ace-network
    depends_on:
      - gateway-service
    environment:
      - NG_PROXY=http://gateway-service:8080

  # ---------------------
  # SonarQube
  # ---------------------
  sonarqube:
    image: sonarqube:latest
    container_name: sonarqube
    ports:
      - "9000:9000"
    volumes:
      - sonarqube_data:/opt/sonarqube/data
    networks:
      - ace-network
    restart: unless-stopped

  sonarqube-db:
    image: postgres
    container_name: sonarqube-db
    environment:
      - POSTGRES_DB=sonarqube
      - POSTGRES_USER=sonar
      - POSTGRES_PASSWORD=sonar_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - ace-network
    restart: unless-stopped

  # ---------------------
  # Portainer
  # ---------------------
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    ports:
      - "9001:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - ace-network
    restart: always

volumes:
  sonarqube_data:
  postgres_data:
  portainer_data:
  prometheus_data:

networks:
  ace-network:
    driver: bridge

```
  # III.  Fonctionnalités
   # 1. Génération de code
     * Les services backend sont générés avec des outils comme Spring Boot Initializer.
     * Intégration des modèles de machine learning pour détecter les anomalies.  
   # 2. Interface utilisateur
     L’interface utilisateur permet :
     * La visualisation des trajectoires des véhicules en temps réel.
     * La gestion des utilisateurs.
     * L’affichage des alertes et des anomalies détectées.
  #  IV.	Guide d'installation
   # 1.	Prérequis
      1.2 Environnement de Développement

       * Python 3.10
       * Java JDK 17 ou supérieur et Maven pour les services backend
       * Node.js 22.x ou supérieur
       * Docker installé
       * Git
       
   # 2.  Installation et configuration
   
       * Clonez le projet depuis le dépôt GitHub :
           git clone https://github.com/OubaallaElMehdi/AceFulPj.git

       * Naviguez vers le répertoire du projet :
           cd AceFulPj
       * Construisez et lancez les conteneurs Docker :
           docker-compose up
       * Configurez GitHub actions pour exécuter les pipelines de compilation, construction et de déploiement.
   # 3.  Déploiement
       * Utilisez Docker Compose pour déployer en local ou sur un serveur distant.
       * Le projet est hébergé sur un serveur distant et accessible via le domaine :
            http://culturenaturevoyages.com:3000/
       * SonarQube est accessible pour l’analyse de code via :
            http://culturenaturevoyages.com:9000


[![Watch the demo video](https://yourserver.com/path/to/thumbnail.jpg)](http://culturenaturevoyages.com:1234/ace-demo.mp4)

