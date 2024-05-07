import Swal from 'sweetalert2'

export default {
  data() {
    return {
      // toastMixin: "",
    }
  },
  created: function () {
    // console.log("Printing from the Mixin");
  },
  methods: {
    displayToastAlert: function (message, icon) {
      this.toastMixin = Swal.mixin({
        toast: true,
        icon: 'success',
        animation: false,
        position: 'top-right',
        showConfirmButton: false,
        // background: "#74788d",
        // color: "#fff",
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
      })

      this.toastMixin.fire({
        title: message,
        icon: icon,
      })
    },
    displayConfirmationAlert: async function (
      title,
      text,
      icon,
      confirmButtonText,
      cancelButtonText
    ) {
      return await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#34c38f',
        cancelButtonColor: '#f46a6a',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
      })
    },
    displayImportAlert: async function (
      title,
      text,
      icon,
      confirmButtonText
      // cancelButtonText
    ) {
      return await Swal.fire({
        title: title,
        // text: text,
        html: text,
        icon: icon,
        showCancelButton: false,
        confirmButtonColor: '#34c38f',
        cancelButtonColor: '#f46a6a',
        confirmButtonText: confirmButtonText,
        // cancelButtonText: cancelButtonText,
      })
    },
    // i want to display a toast alert that has 3 buttons, 2 confirm and 1 cancel buttons
    diplsayThreeOptions: async function (title, text) {
      return await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Obriši listu',
        denyButtonText: 'Obriši sve',
        cancelButtonText: 'Odustani',
        confirmButtonColor: '#34c38f',
        denyButtonColor: '#34c38f',
        cancelButtonColor: '#f46a6a',
      })
    },
  },
}
