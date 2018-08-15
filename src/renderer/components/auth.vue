<template>

    <div class="account">
        <div class="page-container">
            <h1 class="title">SHUTTLE WITH YOU, <span class="italic">EVERYWHERE.</span></h1>
            <p class="description">Create a shuttle account to keep<br>your bookmarks <span class="italic">everywhere</span> you go.</p>
            
            <div class="form">
                <h4 class="methode">{{ methodText }} <span class="error">{{ errorText }}</span></h4>
                <input id="email_textbox" class="textbox" type="email" placeholder="E-MAIL">
                <input id="pass_textbox" class="textbox" type="password" placeholder="PASSWORD">
                <input v-if="method === 'signup'" id="conf_pass_textbox" class="textbox" type="password" placeholder="CONFIRM PASSWORD">
                <a href="#" class="methodeBtn btn">{{ methodText.toUpperCase() }}</a>
                <p v-if="method === 'login'" class="askOtherMethode">YOU DON'T HAVE ANY ACCOUNT ? <a href="#" v-on:click="toggleMethod" class="link">SIGN-UP</a> HERE</p>
                <p v-if="method === 'signup'" class="askOtherMethode">YOU HAVE ALREADY AN ACCOUNT ? <a href="#" v-on:click="toggleMethod" class="link">LOG-IN</a> YOU HERE</p>
            </div>
        </div>
        <p class="temsOfUse">BY LOG-IN, YOU ALSO ACCEPT <a href="#" v-on:click="showTemsOfUse" class="link gray">GENERAL TERMS OF USE</a></p>
        <router-link :to="{ name: 'browser' }" class="close"></router-link>
    </div>
    
</template>

<style src="./auth/auth.css"></style>
<script src="./auth/auth.js"></script>
