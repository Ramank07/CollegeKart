#include<bits/stdc++.h>
using namespace std;
#define ll long long int
#define dbl long long double
const ll cons = 1e9+7;
#define pb push_back
#define lup(x,variable,n) for(int variable = x; variable < n; variable++)
// /* ascii value A=65,Z=90,a=97,z=122 */
void get()
{	
    ll n,a,b;
    cin>>n>>a>>b;
    ll ans=0;
    
      
      int i=1;
    //   b=b-1;
    ll dif=b-a;
    if(dif>0){
    //   while((b-i+1)>a && n>0){
    //     ans+=b-i+1;
    //     i++;
    //     n--;
       
    //   }
    ll val=dif*(dif+1);
    val=val/2;
    
      if(n>0){
        ans+=(n*a);
      }
       cout<<ans<<endl;
    }
       

    
    

}
int main()
{	
ios::sync_with_stdio(0);cin.tie(0);
int tc;
cin>>tc;
while(tc--){
 get();
}
    return 0;
}