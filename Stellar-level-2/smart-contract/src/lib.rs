#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub name: String,
    pub target: i128,
    pub deadline: u64,
    pub balance: i128,
    pub owner: Address,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Campaign(u64),
    CampaignCount,
    UserDonations(Address),
}

#[contract]
pub struct BuyMeACoffeeContract;

#[contractimpl]
impl BuyMeACoffeeContract {
    /// Initialize the contract with an admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CampaignCount, &0u64);
    }

    /// Create a new campaign
    pub fn create_campaign(env: Env, name: String, target: i128, deadline: u64, owner: Address) -> u64 {
        owner.require_auth();

        // Get current count
        let mut count: u64 = env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0);
        count += 1;

        let campaign = Campaign {
            name,
            target,
            deadline,
            balance: 0,
            owner,
            active: true,
        };

        env.storage().instance().set(&DataKey::Campaign(count), &campaign);
        env.storage().instance().set(&DataKey::CampaignCount, &count);

        env.events().publish(
            (symbol_short!("Campaign"), symbol_short!("created")),
            (count, campaign.name.clone(), campaign.owner.clone(), campaign.target),
        );

        count
    }

    /// Donate to a campaign via token transfer is complex without inputs. 
    /// Detailed implementation usually involves transferring tokens to the contract address.
    /// For simplicity in this demo, we assume native XLM or a specific token integration.
    /// Here we'll just track the balance update assuming the transfer logic is handled or we use a token client.
    /// 
    /// REAL IMPLEMENTATION: The user transfers tokens to the contract, calling a function that records it.
    /// Or we use the `token` interface.
    /// Let's use a simplified approach: Input header says "donate".
    pub fn donate(env: Env, campaign_id: u64, amount: i128, token: Address, from: Address) {
        from.require_auth();
        
        let key = DataKey::Campaign(campaign_id);
        let mut campaign: Campaign = env.storage().instance().get(&key).expect("Campaign not found");

        if !campaign.active {
            panic!("Campaign is not active");
        }
        
        if env.ledger().timestamp() > campaign.deadline {
             panic!("Campaign ended");
        }

        // Transfer tokens from user to contract
        // Note: For this to work, the contract needs to be the destination of a `transfer_from` or verified transfer.
        // Soroban Token Interface:
        let token_client = soroban_sdk::token::Client::new(&env, &token);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        campaign.balance += amount;
        env.storage().instance().set(&key, &campaign);

        env.events().publish(
            (symbol_short!("Donation"), symbol_short!("received")),
            (campaign_id, from.clone(), amount),
        );
    }

    /// Withdraw funds (Campaign owner only)
    pub fn withdraw(env: Env, campaign_id: u64, token: Address) {
         let key = DataKey::Campaign(campaign_id);
        let mut campaign: Campaign = env.storage().instance().get(&key).expect("Campaign not found");
        
        campaign.owner.require_auth();
        
        if campaign.balance > 0 {
             let token_client = soroban_sdk::token::Client::new(&env, &token);
             token_client.transfer(&env.current_contract_address(), &campaign.owner, &campaign.balance);
             
             campaign.balance = 0;
             campaign.active = false; // Mark as done/withdrawn
             env.storage().instance().set(&key, &campaign);
        }
    }
    
    pub fn get_campaign(env: Env, campaign_id: u64) -> Campaign {
        env.storage().instance().get(&DataKey::Campaign(campaign_id)).expect("Campaign not found")
    }

    pub fn get_campaign_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::CampaignCount).unwrap_or(0)
    }
}


#[cfg(test)]
mod test;
