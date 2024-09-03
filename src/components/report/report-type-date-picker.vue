<script>
/**
 * Reports-Date-Picker component
 */
 export default {
    data() {
        return {
            s_date: '',
            e_date: '',
            s_time: '',
            e_time: '',
            context: null,

            r_type: '',
            
            preselectedReport: "account_types",
            reportTypeOptions:[
                {
                value: "account_types",
                text: this.$t("label.account_types"),
                disabled: false,
                },
                {
                value: "payment_methods",
                text: this.$t("label.payment_methods"),
                disabled: false,
                },
                {
                value: "operators",
                text: this.$t("label.operators"),
                disabled: false,
                },
                {
                value: "items",
                text: this.$t("label.items"),
                disabled: false,
                },
                {
                value: "tax_items",
                text: this.$t("label.tax_items"),
                disabled: false,
                },
                {
                value: "bills",
                text: this.$t("label.bills"),
                disabled: false,
                }
            ],
        }
    },

    mounted() {
        this.mountDayTimeReportType(new Date());
        //this.mountReportDateAndTime();
        //this.storageReportDays();
        this.mountedReportType();

        const css = `
        .calendar-info-selected {
            background: #d6f3e9;
        }`
        this.styleTag = document.createElement('style');
        this.styleTag.appendChild(document.createTextNode(css));
        document.head.appendChild(this.styleTag);
    },

    destroyed() {
        this.styleTag.remove();
    },

    methods: {
        dateClass(ymd) {
            if(!this.e_date.getMonth) return;
            this.e_date.setHours(23, 59, 59, 59);
            const day = new Date(ymd);
            if(this.s_date > this.e_date){
                this.e_date = this.s_date;
                }
            return (day >= this.s_date && day <= this.e_date) ? 'calendar-info-selected' : ''
        },

        mountedReportType(){
            if(this.$store.state.reports.reportType.repType === ''){
                this.reportTypeOptionSelected(this.preselectedReport)
            }else{
                this.r_type = this.$store.state.reports.reportType.repType;
            }
        },
        
        mountDayTimeReportType(today){
          let today_for_storage = today.toISOString().split('T')[0];
          //today_for_storage = '2024-08-01';
          //new day 
          if(this.$store.state.reports.viewDateP.vDate == '' || today_for_storage != this.$store.state.reports.viewDateP.vDate){
            this.$store.state.reports.viewDateP.vDate = today_for_storage;
            this.mountDatesReportNewSes();
          }else{
            this.getDatesReportTypeFromStorage();
          }

        },
        
        mountDatesReportNewSes(){
          this.e_date = new Date(); 
          this.e_date.setHours(23, 59, 59);
          this.e_time = "23:59:59";

          this.s_date = new Date(); 
          this.s_date.setDate(this.e_date.getDate() - 1);
          this.s_time = "00:00:00";
          
          this.s_date.setHours(0, 0, 0);
        },

        getDatesReportTypeFromStorage(){
          this.s_date = this.$store.state.reports.reportDays.startDay;
          this.e_date = this.$store.state.reports.reportDays.endDay;
          this.s_time = this.$store.state.reports.reportDays.startTime;
          this.e_time = this.$store.state.reports.reportDays.endTime;
        },

        reportTypeOptionSelected(value){
            this.r_type = value;
            this.storeReportType();
        },

        startDateSet(sday){
            if(this.s_date == -1) {
              this.s_time = -1
              return;
            }
            this.s_date = new Date(sday.activeDate);
            if(this.s_time == -1 || this.s_time == "") this.s_time = "00:00:00";
            let hours = this.s_time.split(":"); 
            this.s_date.setHours(hours[0], hours[1], hours[2]);
            this.storageReportDays();
        },

        startTimeSet(stime){
          if(this.s_time == -1 || this.s_date == -1) return;
          this.s_time = stime.value;
          this.startDateSet(this.s_date);
        },

        endDateSet(eday){
            if(this.e_date == -1) {
              this.e_time = -1;
              return;
            }
            this.e_date = new Date(eday.activeDate);
            if(this.e_time == -1 || this.e_time == "") this.e_time = "23:59:59";
            let hours = this.e_time.split(":"); 
            this.e_date.setHours(hours[0], hours[1], hours[2]);
            this.storageReportDays();
        },

        endTimeSet(etime){
          if(this.e_time == -1 || this.e_date == -1) return;
          this.e_time = etime.value;
          this.endDateSet(this.e_date);
        },

        storageReportDays(){
            this.$store.dispatch("reports/addReportDays", { 
                startDay  : this.s_date, 
                endDay    : this.e_date,
                startTime : this.s_time,
                endTime   : this.e_time
            });
        },

        storeReportType(){
            this.$store.dispatch("reports/addReportType", { 
                repType : this.r_type,
            });
        },

        timeReset(){
            this.s_date = -1;
            this.e_date = -1;
            this.s_time = -1;
            this.e_time = -1;
            this.$store.dispatch("reports/addReportDays", { 
                startDay  : -1,
                endDay    : -1,
                startTime : -1,
                endTime   : -1
            });
        }
    },
 }

</script>

<template>
    <div class="mb-2 p-4">
        <b-row class="bg-white p-2">
          <b-col md="auto">
            <div class="my-2" style="width: 350px">
              <h4 class="card-title">{{ $t('label.report_type_heading') }}</h4>
              <b-form-select
                v-model="r_type"
                class="form-select"
                @change="reportTypeOptionSelected"
                id="formrow-inputState"
                :options="reportTypeOptions"
              ></b-form-select>
            </div>
          </b-col>
          <b-col md="auto">
            <div class="position-relative my-2" style="width: 350px; height: 40px;">
              <div class="position-absolute top-4 end-0">
                  <b-button @click="timeReset()" variant="danger">{{ $t('label.report_date_time_reset') }} &nbsp; &nbsp;<i class="far fa-calendar-times"></i></b-button>
              </div>
            </div>
          </b-col>
          <h4 class="card-title mt-4">{{ $t('label.report_time_heding') }}</h4>
        </b-row>

        <b-row class="bg-white p-2">
          <b-col class="border-end border-secondary" md="auto">
            <div class="my-4" style="width: 350px">
                <label for="start-date-datepicker">{{ $t('label.report_date_start_label') }}</label>
                  <b-form-datepicker
                    id="start-date-datepicker"
                    value-as-date
                    start-weekday="1" 
                    locale="sh-SH"
                    v-model="s_date" 
                    @context="startDateSet"
                  ></b-form-datepicker>
            
                <div class="my-4">
                  <label for="start-date-timepicker">{{ $t('label.report_time_start_label') }}</label>
                  <b-form-timepicker
                    id="start-date-timepicker" 
                    class="mb-2"
                    locale="sh-SH"
                    v-model="s_time"
                    @context="startTimeSet"
                  ></b-form-timepicker>
                </div>
            </div>
          </b-col>

          <b-col class="border-end border-secondary" md="auto">
            <div class="mt-4" style="width: 350px">
                <label for="end-date-datepicker">{{ $t('label.report_date_end_label') }}</label>
                <b-form-datepicker
                  id="end-date-datepicker" 
                  value-as-date
                  start-weekday="1"
                  locale="sh-SH"
                  v-model="e_date" 
                  @context="endDateSet"
                  class="mb-2"
                ></b-form-datepicker>
                <div class="my-4">
                  <label for="start-date-timetepicker">{{ $t('label.report_time_end_label') }}</label>
                  <b-form-timepicker
                    id="end-date-timepicker" 
                    class="mb-2"
                    locale="sh-SH"
                    v-model="e_time"
                    @context="endTimeSet"
                  ></b-form-timepicker>
                </div>
            </div>
          </b-col>
          <b-col md="auto">
            <div class="mt-4" style="width: 350px">
              <div v-if="s_date == -1 || e_date == -1">
                <p v-if="s_date == -1" class="mt-2"><strong><i class="far fa-calendar-times"></i></strong> &nbsp; &nbsp; {{ $t('label.report_start_date_time_reset_label') }}</p>
                <p v-if="e_date == -1" class="mt-2"><strong><i class="far fa-calendar-times"></i></strong> &nbsp; &nbsp; {{ $t('label.report_end_date_time_reset_label') }}</p>
              </div>
              <b-calendar 
                v-else
                block
                style="width: 350px"
                locale="sh-SH"
                readonly="readonly"  
                start-weekday="1"
                hide-header=true
                :date-info-fn="dateClass"
              ></b-calendar>
            </div>
            </b-col>
        </b-row>
      </div>
</template>