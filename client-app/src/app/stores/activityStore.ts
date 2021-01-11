import { observable, action, makeObservable, computed ,configure,runInAction } from "mobx";
import { config } from "process";
import { createContext, SyntheticEvent } from "react";
import agent from "../api/agent";
import { IActivity } from "../models/activity";

configure({enforceActions:'always'});

class ActivityStore{
  @observable activityRegistry = new Map();
  @observable activities:IActivity[] = [];
  @observable loadingInitial= false;
  @observable selectedActivity:IActivity|undefined;
  @observable editMode = false;
  @observable submitting = false;
  @observable target = '';

  @computed get activitiesByDate(){
    return Array.from(this.activityRegistry.values()).sort((a,b)=>Date.parse(a.date) - Date.parse(b.date))
  };

  @action loadActivities = async () =>{
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction(()=>{
        activities.forEach((activity)=>{
          activity.date = activity.date.split('.')[0]
          this.activityRegistry.set(activity.id,activity);
        })
        this.loadingInitial=false
      })
      
    } catch (error) {
      runInAction(()=>{
        this.loadingInitial=false
      })
      console.log(error)
     
    }
  };

  @action selectActivity=(id:string)=>{
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode= false;
  };

  @action createActivity= async (activity:IActivity)=>{
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      this.activityRegistry.set(activity.id,activity);
      this.editMode = false;
      this.submitting = false;

    } catch (error) {
      this.submitting = false;
      console.log(error);
    }
  };

  @action editActivity = async (activity:IActivity)=>{
    this.submitting=true;
    try {
      await agent.Activities.update(activity);
      this.activityRegistry.set(activity.id,activity);
      this.selectedActivity = activity;
      this.editMode = false;
      this.submitting = false;
    } catch (error) {
      this.submitting = false;
      console.log(error);
    }
  }

  @action deleteActivity = async (event:SyntheticEvent<HTMLButtonElement>,id:string) =>{
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      this.activityRegistry.delete(id);
    } catch (error) {
      console.log(error);
    } finally {
      this.submitting = false;
      this.target = '';
    }

  }

  @action openEditForm =(id:string)=>{
    this.selectedActivity = this.activityRegistry.get(id);
    this.editMode=true;
  }

  @action openCreateForm = ()=>{
    this.editMode=true;
    this.selectedActivity = undefined;
  }

  @action cancelSelectedActivity=()=>{
    this.selectedActivity = undefined;
  }

  @action cancelFormOpen=()=>{
    this.editMode=false;
  }

  constructor(){
    makeObservable(this);
  };
}

export default createContext(new ActivityStore())