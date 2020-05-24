<template>
  <div>
    <div class="dialog">
      <h1>Whoops!</h1>
      <p v-if="error.statusCode === 404">
        Clumsy us, we were unable to find the page you were looking for
      </p>
      <p v-else>
        It seems that an error has occured...
      </p>
    </div>
    <img src="~/assets/groceries.png" class="image" />
    <footer>
      <a href="http://www.free404.com" target="_blank">free404.com</a>
    </footer>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line vue/require-prop-types
  props: ['error'],
  layout: 'empty',
  head() {
    return {
      title:
        this.error.statusCode === 404
          ? "The page you were looking for doesn't exist (404)"
          : 'An error has occurred'
    }
  }
}
</script>

<style scoped>
body {
  background-color: #fff;
  color: #2e2f30;
  font-family: sans-serif;
  margin: 0;
}

footer {
  position: absolute;
  bottom: 1%;
  width: 100%;
  text-align: center;
  font-size: 0.6em;
  color: #393939;
}

a {
  color: #393939;
}

a:hover {
  color: #393939;
}

.dialog {
  float: right;
  text-align: left;
  width: 45%;
  margin: 5% auto 0;
}

h1 {
  font-size: 5em;
  color: #393939;
  line-height: 1.5em;
}

p {
  font-size: 1.4em;
  color: #393939;
  padding-right: 5%;
}
.image {
  float: left;
  width: 50%;
  margin: 5% 0 0 5%;
}
@media only screen and (max-width: 767px) {
  .image {
    width: 90%;
    margin: 5% 0 0 5%;
  }
  .dialog {
    float: none;
    text-align: center;
    width: 90%;
  }
}
</style>
