var app = angular.module("appFootball", ['ngRoute']);

app.run(function ($http, $rootScope, $location) {
    $http.defaults.headers.common['X-Auth-Token'] = '7b35712f29da4dc58a538320e57c12cc';
    //var firebaseAuthObject = AuthService.();
    var config = {
        apiKey: "AIzaSyAp0JavN1NGZONHRsKk4fcBAU_Jw_HAras",
        authDomain: "futebol-56191.firebaseapp.com",
        databaseURL: "https://futebol-56191.firebaseio.com",
        projectId: "futebol-56191",
        storageBucket: "futebol-56191.appspot.com",
        messagingSenderId: "975279569273"
    };
    firebase.initializeApp(config);
    firebase.auth().useDeviceLanguage();
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        var auth = firebase.auth();
        if (auth.currentUser == null || window.sessionStorage.getItem("user") == null) {
            auth.signOut();
            window.sessionStorage.removeItem("user");
            $location.path("/login");
        } else {
            window.sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
        }
    });
    
});


app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: "pages/times.html",
            controller: "TimesController"
        })
        .when('/MeusTimes', {
            templateUrl: "pages/meustimes.html",
            controller: "MeusTimesController"
        })
        .when('/jogadores/:id', {
            templateUrl: "pages/jogadores.html",
            controller: "JogadoresController"
        })
        .when('/cadastro/:id?', {
            templateUrl: "pages/cadastro.html",
            controller: "CadastroController"
        })
        .when('/login', {
            templateUrl: 'pages/login.html',
            controller: "LoginController"
        })
        .otherwise({ redirectTo: '/' });
});

app.controller("LoginController", function ($scope, $http, $location, $routeParams) {
    var auth = firebase.auth();
    $scope.entrar = function(){
        var usuario = $scope.usuario;
        if (usuario != null) {
            auth.signInWithEmailAndPassword(usuario.email, usuario.senha)
                .then(function () {
                    window.sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
                    $location.path('/MeusTimes');
                    $scope.$apply();
                })
                .catch(function (error) {
                    alert(error);
                });
        } else {
            alert("Informe o usuário e senha.");
        }
    }

    $scope.cadastrar = function () {
        var usuario = $scope.usuario;
        if (usuario != null) {
            auth.createUserWithEmailAndPassword(usuario.email, usuario.senha)
                .then(function () {
                    alert("Cadastro realizado com sucesso!");
                    window.sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
                    $location.path('/MeusTimes');
                    $scope.$apply();
                })
                .catch(function (error) {
                    alert(error);
                });
        }
        else {
            alert("Informe o usuário e senha.");
        }
    }

    $scope.entrarGoogle = function () {
        var provider = new firebase.auth.GoogleAuthProvider(); 

        auth.signInWithPopup(provider)
            .then(function (result) {
                window.sessionStorage.setItem("user", JSON.stringify(auth.currentUser));
                $location.path('/MeusTimes');
                $scope.$apply();
            }).catch(function (error) {
                alert(error);
            });
    }
});

app.controller("MeusTimesController", function ($scope, $http, $routeParams, $location) {
    var strTimes = window.localStorage.getItem("times");
    $scope.usuario = JSON.parse(window.sessionStorage.getItem("user"));
    if (strTimes == null) {
        $scope.times = []
    } else {
        var times = JSON.parse(strTimes);
        $scope.times = times.filter(x => x.uid == $scope.usuario.uid);
    }

    $scope.sair = function() {
        var auth = firebase.auth();
        auth.signOut();
        window.sessionStorage.removeItem("user");
        $location.path = "/login";
        $scope.$apply();
    }
});

app.controller("TimesController", function ($scope, $http, $routeParams) {
    $http.get('https://api.football-data.org/v2/teams?areas=2077').
        then(function (response) {
            $scope.times = response.data.teams;
        });
});

app.controller("CadastroController", function ($scope, $http, $routeParams, $location) {
    $scope.usuario = JSON.parse(window.sessionStorage.getItem("user"));

    var strTimes = window.localStorage.getItem("times")

    if (strTimes == null) {
        $scope.times = []
    } else {
        var times = JSON.parse(strTimes);
        $scope.times = times;
    }

    if ($routeParams.id) {
        $scope.time = $scope.times.find(x => x.id == $routeParams.id && x.uid == $scope.usuario.uid);
    }

    $scope.incluirJogador = function (jogador) {
        var jog = {}
        jog.posicao = jogador.posicao;
        jog.nome = jogador.nome;
        jog.dataNascimento = jogador.dataNascimento;
        if ($scope.time.jogadores == null) {
            $scope.time.jogadores = [];
        }
        $scope.time.jogadores.push(jog);
        $scope.jogador = {};
    }

    $scope.salvarTime = function () {

        $scope.time.uid = $scope.usuario.uid;

        if ($scope.time.id == null) {
            $scope.time.id = guid();
            $scope.times.push($scope.time);
        }

        window.localStorage.setItem("times", JSON.stringify($scope.times));
        alert('Cadastro realizado com sucesso!');
        $location.path("/MeusTimes");
        $scope.$apply();
    }

    $scope.cancelar = function () {
        $location.path("/MeusTimes");
        $scope.$apply();
    }
});


app.controller("JogadoresController", function ($scope, $http, $routeParams) {
    $scope.message = "JogadoresController";
    $http.get('https://api.football-data.org/v2/teams/' + $routeParams.id ).
        then(function (response) {
            $scope.time = response.data;
        });

    $http.get('https://api.football-data.org/v1/teams/' + $routeParams.id).
        then(function (response) {
            $scope.logoTime = response.data.crestUrl;
        });
    $scope.parametros = $routeParams
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}