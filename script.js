class FormsValidation {
  //все селекторы для отслеживания
  selectors = {
    form: "[data-js-form]",
    fieldErrors: "[data-js-form-field-errors]",
  };
  errorMessages = {
    valueMissing: () => "Пожалуйста, заполните это поле",
    patternMismatch: ({ title }) => title || "Данные не соответствуют формату",
    tooShort: ({ minLength }) =>
      `Слишком короткое значение, минимум символов — ${minLength}`,
    tooLong: ({ maxLength }) =>
      `Слишком длинное значение, ограничение символов — ${maxLength}`,
  };

  constructor() {
    this.bindEvents();
  }
  //визуализация ошибок
  manageErrors(fieldControlElement, errorMessages) {
    const fieldErrorsElement = fieldControlElement.parentElement.querySelector(
      this.selectors.fieldErrors
    );
    fieldErrorsElement.textContent = errorMessages
      .map((message) => `${message}`)
      .join("");
    // fieldErrorsElement.innerHTML = errorMessages
    //   .map((message) => `<span class="field__error">${message}</span>`)
    //   .join('')
  }

  validateField(fieldControlElement) {
    const errors = fieldControlElement.validity;
    const errorMessages = [];

    Object.entries(this.errorMessages).forEach(
      ([errorType, getErrorMessage]) => {
        if (errors[errorType]) {
          errorMessages.push(getErrorMessage(fieldControlElement));
        }
      }
    );

    this.manageErrors(fieldControlElement, errorMessages);

    const isValid = errorMessages.length === 0;

    fieldControlElement.ariaInvalid = !isValid;

    return isValid;
  }

  onBlur(event) {
    const { target } = event;
    const isFormField = target.closest(this.selectors.form);
    const isRequired = target.required;

    if (isFormField && isRequired) {
      this.validateField(target);
    }
  }

  onChange(event) {
    const { target } = event;
    const isRequired = target.required;
    const isToggleType = ["radio", "checkbox"].includes(target.type);

    if (isToggleType && isRequired) {
      this.validateField(target);
    }
  }

  formSendServer(e) {
    console.log(e.target);
    let ajaxSend = async (FORM_DATA) => {
      let response = await fetch("/ajax/ajax_send_mail.php", {
        method: "POST",
        body: FORM_DATA,
      });
      if (!response.ok) {
        throw new Error(
          `Ошибка по адресу ${window.location.href}, статус ошибки ${
            response.status
          },${response.json()},${response}`
        );
      }
      console.log(window.location.href);

      return await response.text();
    };
    let FORM_DATA = new FormData(e.target);
    ajaxSend(FORM_DATA)
      .then((response) => {
        console.log(response);
        e.target.reset(); // очищаем поля формы
      })
      .catch((err) => console.error(err));
  }

  onSubmit(event) {
    const isFormElement = event.target.matches(this.selectors.form);
    if (!isFormElement) {
      return;
    }

    const requiredControlElements = [...event.target.elements].filter(
      ({ required }) => required
    );
    let isFormValid = true;
    let firstInvalidFieldControl = null;

    requiredControlElements.forEach((element) => {
      const isFieldValid = this.validateField(element);

      if (!isFieldValid) {
        isFormValid = false;

        if (!firstInvalidFieldControl) {
          firstInvalidFieldControl = element;
        }
      }
    });

    if (!isFormValid) {
      event.preventDefault();
      firstInvalidFieldControl.focus();
    }

    if (isFormValid) {
      this.formSendServer(event);
    }
  }

  bindEvents() {
    for (let ev of ["input", "blur"]) {
      document.addEventListener(
        ev,
        (event) => {
          this.onBlur(event);
        },
        { capture: true }
      );
    }
    document.addEventListener("change", (event) => this.onChange(event));
    document.addEventListener("submit", (event) => this.onSubmit(event));
  }
}

new FormsValidation();

//mask phone

function getMaskPhone() {
  let eventCallback = function (e) {
    let el = e.target,
      clearVal = el.dataset.phoneClear,
      pattern = el.dataset.phonePattern,
      matrix_def = "+7 (___) ___-__-__",
      matrix = pattern ? pattern : matrix_def,
      i = 0,
      def = matrix.replace(/\D/g, ""),
      val = el.value.replace(/\D/g, "");
    if (clearVal !== "false" && e.type === "blur") {
      if (val.length < matrix.match(/([\_\d])/g).length) {
        el.value = "";
        return;
      }
    }
    if (def.length >= val.length) val = def;
    el.value = matrix.replace(/./g, function (a) {
      return /[_\d]/.test(a) && i < val.length
        ? val.charAt(i++)
        : i >= val.length
        ? ""
        : a;
    });
  };

  let phone_inputs = document.querySelectorAll("[data-phone-pattern]");
  for (let elem of phone_inputs) {
    for (let ev of ["input", "blur", "focus"]) {
      elem.addEventListener(ev, eventCallback);
    }
  }
}
getMaskPhone();
